import axios from 'axios';
import * as crypto from 'crypto';
import { MemoryCacheStore } from '../cache/cache-store';
import { PaymentConfigService, PaymentSdkConfig } from '../config/payment-config.service';
import {
  PaymentConfigurationError,
  PaymentValidationError,
} from '../errors/PaymentSdkError';
import { maskSensitiveData } from '../logger/sdk-logger';
import { fromProviderAmount } from '../payments/utils/amount.util';
import { generateBasicAuthHeader } from '../payments/utils/signer.util';
import type { ClickWebhookPayload } from '../payments/types/click.types';
import type { PaymeMerchantApiRequest } from '../payments/types/payme.types';
import type { WebhookPayload } from './webhook.types';

export type { WebhookPayload } from './webhook.types';

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
  private readonly webhookEventHistoryLimit: number;
  private readonly allowInMemoryWebhookIdempotency: boolean;

  constructor(config: PaymentSdkConfig = {}) {
    this.configService = new PaymentConfigService(config);
    this.idempotencyTtlSec = Number(
      config.env?.WEBHOOK_IDEMPOTENCY_TTL_SEC ||
        process.env.WEBHOOK_IDEMPOTENCY_TTL_SEC ||
        3600,
    );
    this.webhookEventHistoryLimit = Math.max(
      0,
      Number(
        config.webhookEventHistoryLimit ??
          config.env?.WEBHOOK_EVENT_HISTORY_LIMIT ??
          process.env.WEBHOOK_EVENT_HISTORY_LIMIT ??
          100,
      ),
    );
    this.allowInMemoryWebhookIdempotency =
      config.allowInMemoryWebhookIdempotency === true ||
      config.env?.ALLOW_IN_MEMORY_WEBHOOK_IDEMPOTENCY === 'true' ||
      process.env.ALLOW_IN_MEMORY_WEBHOOK_IDEMPOTENCY === 'true';
  }

  async processWebhook(webhookData: WebhookPayload): Promise<void> {
    this.assertSharedIdempotencyStore();
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

    this.rememberEvent(event);
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

  parseClickWebhook(
    payload: ClickWebhookPayload,
    signature = payload.sign_string,
  ): WebhookPayload {
    if (
      !signature ||
      !this.validateClickSignature(
        payload as unknown as Record<string, unknown>,
        signature,
      )
    ) {
      throw new PaymentValidationError('Invalid Click webhook signature', {
        provider: 'click',
      });
    }

    const action = Number(payload.action);
    const errorCode = Number(payload.error || 0);
    const providerPaymentId = String(payload.click_trans_id);

    return {
      provider: 'click',
      transactionId: providerPaymentId,
      orderId: String(payload.merchant_trans_id),
      amount: fromProviderAmount(Number(payload.amount)) || 0,
      status: this.mapClickWebhookStatus(action, errorCode),
      timestamp: this.toIsoTimestamp(payload.sign_time),
      providerPaymentId,
      providerStatus: errorCode === 0 ? String(action) : String(errorCode),
      metadata: {
        action,
        signTime: payload.sign_time,
        errorCode,
        errorNote: payload.error_note,
        merchantPrepareId:
          payload.merchant_prepare_id !== undefined
            ? String(payload.merchant_prepare_id)
            : undefined,
      },
      signature,
    };
  }

  parsePaymeWebhook(
    payload: PaymeMerchantApiRequest,
    authorization?: string,
  ): WebhookPayload {
    if (!this.validatePaymeSignature(payload, authorization || '')) {
      throw new PaymentValidationError('Invalid Payme webhook signature', {
        provider: 'payme',
      });
    }

    const orderId =
      this.extractPaymeOrderId(payload.params.account) ||
      String(payload.params.id || 'unknown');
    const providerPaymentId =
      payload.params.id !== undefined ? String(payload.params.id) : undefined;
    const transactionId = providerPaymentId || orderId;

    return {
      provider: 'payme',
      transactionId,
      orderId,
      amount: fromProviderAmount(payload.params.amount) || 0,
      status: this.mapPaymeWebhookStatus(payload.method),
      timestamp: this.toIsoTimestamp(payload.params.time),
      providerPaymentId,
      providerStatus: payload.method,
      metadata: {
        jsonRpcId: payload.id ?? null,
        method: payload.method,
        reason: payload.params.reason,
      },
      signature: authorization,
    };
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

  private mapClickWebhookStatus(
    action: number,
    errorCode: number,
  ): WebhookPayload['status'] {
    if (errorCode < 0) {
      return errorCode === -9 ? 'cancelled' : 'failed';
    }

    return action === 1 ? 'success' : 'pending';
  }

  private mapPaymeWebhookStatus(
    method: PaymeMerchantApiRequest['method'],
  ): WebhookPayload['status'] {
    switch (method) {
      case 'PerformTransaction':
        return 'success';
      case 'CancelTransaction':
        return 'cancelled';
      case 'CheckPerformTransaction':
      case 'CreateTransaction':
      case 'CheckTransaction':
      default:
        return 'pending';
    }
  }

  private extractPaymeOrderId(
    account?: Record<string, unknown>,
  ): string | undefined {
    if (!account) {
      return undefined;
    }

    const orderId = account.order_id ?? account.orderId ?? account.order;
    return orderId !== undefined ? String(orderId) : undefined;
  }

  private toIsoTimestamp(value?: string | number): string {
    if (typeof value === 'number') {
      return new Date(value < 1_000_000_000_000 ? value * 1000 : value).toISOString();
    }

    if (typeof value === 'string') {
      const numeric = Number(value);
      if (!Number.isNaN(numeric) && value.trim() !== '') {
        return new Date(
          numeric < 1_000_000_000_000 ? numeric * 1000 : numeric,
        ).toISOString();
      }

      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString();
      }
    }

    return new Date().toISOString();
  }

  private rememberEvent(event: WebhookEvent): void {
    if (this.webhookEventHistoryLimit <= 0) {
      return;
    }

    this.webhookEvents.push(event);

    if (this.webhookEvents.length > this.webhookEventHistoryLimit) {
      this.webhookEvents.splice(
        0,
        this.webhookEvents.length - this.webhookEventHistoryLimit,
      );
    }
  }

  private assertSharedIdempotencyStore(): void {
    if (
      this.configService.cacheStore instanceof MemoryCacheStore &&
      !this.allowInMemoryWebhookIdempotency
    ) {
      throw new PaymentConfigurationError(
        'WebhookService requires a shared cacheStore for idempotency in multi-instance environments. Inject Redis/DB-backed cacheStore, or set allowInMemoryWebhookIdempotency only for single-process development.',
      );
    }
  }
}
