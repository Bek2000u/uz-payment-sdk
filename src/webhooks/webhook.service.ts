import axios from 'axios';
import * as crypto from 'crypto';
import { PaymentConfigService, PaymentSdkConfig } from '../config/payment-config.service';
import { maskSensitiveData } from '../logger/sdk-logger';
import { generateBasicAuthHeader } from '../payments/utils/signer.util';
import { WebhookPayload } from './webhook.types';

export { WebhookPayload } from './webhook.types';

export interface WebhookEvent {
  id: string;
  type:
    | 'payment.success'
    | 'payment.failed'
    | 'payment.cancelled'
    | 'payment.pending';
  data: WebhookPayload;
  timestamp: string;
  processed: boolean;
}

export interface EnterpriseWebhookEnvelope {
  version: '2026-04-15';
  source: string;
  eventId: string;
  eventType: WebhookEvent['type'];
  occurredAt: string;
  provider: string;
  payment: {
    transactionId: string;
    orderId: string;
    amount: number;
    status: WebhookPayload['status'];
  };
  metadata: {
    idempotencyKey: string;
    forwardedAt: string;
  };
  raw: WebhookPayload;
}

export class WebhookService {
  readonly configService: PaymentConfigService;
  private readonly webhookEvents: WebhookEvent[] = [];
  private readonly idempotencyTtlSec: number;

  constructor(config: PaymentSdkConfig = {}) {
    this.configService = new PaymentConfigService(config);
    this.idempotencyTtlSec = Number(
      config.env?.WEBHOOK_IDEMPOTENCY_TTL_SEC ||
        process.env.WEBHOOK_IDEMPOTENCY_TTL_SEC ||
        3600,
    );
  }

  async processWebhook(webhookData: WebhookPayload): Promise<void> {
    const eventKey = this.buildEventKey(webhookData);
    const idempotencyKey = `webhook:idempotency:${eventKey}`;
    const reserved = await this.configService.cacheStore.setIfNotExists?.(
      idempotencyKey,
      {
        status: 'processing',
        provider: webhookData.provider,
        transactionId: webhookData.transactionId,
      },
      this.idempotencyTtlSec,
    );

    if (reserved === false) {
      this.configService.logger.warn?.('Duplicate webhook skipped', {
        eventKey,
        provider: webhookData.provider,
        transactionId: webhookData.transactionId,
        orderId: webhookData.orderId,
      });
      return;
    }

    const eventId = this.generateEventId(eventKey);
    const event: WebhookEvent = {
      id: eventId,
      type: `payment.${webhookData.status}` as WebhookEvent['type'],
      data: webhookData,
      timestamp: webhookData.timestamp,
      processed: false,
    };

    this.webhookEvents.push(event);
    this.configService.logger.info?.('Webhook event created', {
      eventId,
      provider: webhookData.provider,
      transactionId: webhookData.transactionId,
      orderId: webhookData.orderId,
      status: webhookData.status,
    });

    try {
      await this.handleWebhookEvent(event);
      await this.configService.cacheStore.set?.(
        idempotencyKey,
        { status: 'processed', eventId },
        this.idempotencyTtlSec,
      );
    } catch (error) {
      await this.configService.cacheStore.del?.(idempotencyKey);
      throw error;
    }
  }

  async forwardWebhookEvent(event: WebhookEvent): Promise<void> {
    const config = this.configService.enterpriseWebhookForwardingConfig;
    if (!config.enabled || !config.url) {
      return;
    }

    const envelope = this.buildEnterpriseWebhookEnvelope(event);
    const body = JSON.stringify(envelope);
    const signature = config.secret
      ? crypto.createHmac('sha256', config.secret).update(body).digest('hex')
      : undefined;

    await axios.post(config.url, envelope, {
      timeout: config.timeoutMs,
      headers: {
        'Content-Type': 'application/json',
        [`${config.headerPrefix}-Event-Id`]: envelope.eventId,
        [`${config.headerPrefix}-Event-Type`]: envelope.eventType,
        [`${config.headerPrefix}-Provider`]: envelope.provider,
        ...(signature
          ? { [`${config.headerPrefix}-Signature`]: signature }
          : {}),
      },
    });
  }

  buildEnterpriseWebhookEnvelope(event: WebhookEvent): EnterpriseWebhookEnvelope {
    const forwardingConfig = this.configService.enterpriseWebhookForwardingConfig;
    return {
      version: '2026-04-15',
      source: forwardingConfig.source,
      eventId: event.id,
      eventType: event.type,
      occurredAt: event.timestamp,
      provider: event.data.provider,
      payment: {
        transactionId: event.data.transactionId,
        orderId: event.data.orderId,
        amount: event.data.amount,
        status: event.data.status,
      },
      metadata: {
        idempotencyKey: this.buildEventKey(event.data),
        forwardedAt: new Date().toISOString(),
      },
      raw: event.data,
    };
  }

  validatePaymeSignature(payload: unknown, signature: string): boolean {
    try {
      if (!signature) {
        return false;
      }

      if (signature.startsWith('Basic ')) {
        const expected = generateBasicAuthHeader(
          this.configService.paymeConfig.login || this.configService.paymeConfig.merchantId,
          this.configService.paymeConfig.key!,
        );
        return signature === expected;
      }

      const secretKey = this.configService.paymeConfig.key || '';
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      this.configService.logger.error?.('Payme signature validation failed', {
        error: (error as Error).message,
      });
      return false;
    }
  }

  validateClickSignature(payload: Record<string, unknown>, signature: string): boolean {
    try {
      const secretKey = this.configService.clickConfig.secretKey || '';
      const isPrepare = Number(payload.action) === 0;
      const material = isPrepare
        ? `${payload.click_trans_id}${payload.service_id}${secretKey}${payload.merchant_trans_id}${payload.amount}${payload.action}${payload.sign_time}`
        : `${payload.click_trans_id}${payload.service_id}${secretKey}${payload.merchant_trans_id}${payload.merchant_prepare_id}${payload.amount}${payload.action}${payload.sign_time}`;

      return (
        crypto.createHash('md5').update(material).digest('hex') === signature
      );
    } catch (error) {
      this.configService.logger.error?.('Click signature validation failed', {
        error: (error as Error).message,
      });
      return false;
    }
  }

  getWebhookEvents(limit = 50): WebhookEvent[] {
    return [...this.webhookEvents]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  getUnprocessedEvents(): WebhookEvent[] {
    return this.webhookEvents.filter((event) => !event.processed);
  }

  getEventsByProvider(provider: string): WebhookEvent[] {
    return this.webhookEvents.filter((event) => event.data.provider === provider);
  }

  getEventsByOrderId(orderId: string): WebhookEvent[] {
    return this.webhookEvents.filter((event) => event.data.orderId === orderId);
  }

  private async handleWebhookEvent(event: WebhookEvent): Promise<void> {
    try {
      const message = `Processing ${event.type.replace('payment.', '')} payment`;
      this.configService.logger.info?.(message, {
        provider: event.data.provider,
        transactionId: event.data.transactionId,
        orderId: event.data.orderId,
        payload: maskSensitiveData(event.data),
      });

      await this.forwardWebhookEvent(event);
      event.processed = true;
    } catch (error) {
      this.configService.logger.error?.('Webhook processing failed', {
        eventId: event.id,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  private generateEventId(eventKey?: string): string {
    if (!eventKey) {
      return `webhook_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    }

    return `webhook_${crypto
      .createHash('sha256')
      .update(eventKey)
      .digest('hex')
      .slice(0, 16)}`;
  }

  private buildEventKey(data: WebhookPayload): string {
    return [
      data.provider || 'unknown',
      data.transactionId || 'unknown',
      data.orderId || 'unknown',
      data.status || 'unknown',
      String(data.amount || 0),
    ].join(':');
  }
}
