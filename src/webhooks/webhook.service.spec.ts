import axios from 'axios';
import * as crypto from 'crypto';
import { MemoryCacheStore } from '../cache/cache-store';
import { WebhookService } from './webhook.service';

describe('WebhookService', () => {
  let service: WebhookService;
  let postSpy: jest.SpiedFunction<typeof axios.post>;

  beforeEach(() => {
    jest.clearAllMocks();
    postSpy = jest.spyOn(axios, 'post');

    service = new WebhookService({
      cacheStore: new MemoryCacheStore(),
      enterpriseWebhookForwarding: {
        enabled: true,
        url: 'https://hooks.example.test/payments/webhook',
        secret: 'forward-secret',
        timeoutMs: 5000,
        source: 'my-sdk',
        headerPrefix: 'X-MySDK',
      },
      providers: {
        payme: {
          merchantId: 'merchant-login',
          login: 'merchant-login',
          key: 'payme-secret',
          apiUrl: 'https://checkout.test.paycom.uz/api',
        },
        click: {
          serviceId: '101202',
          merchantId: 'merchant-1',
          merchantUserId: 'merchant-user-1',
          secretKey: 'click-secret',
          apiUrl: 'https://api.click.uz/v2/merchant',
        },
      },
    });
  });

  it('uses idempotency reservation before processing', async () => {
    postSpy.mockResolvedValue({ data: { ok: true } } as never);

    await service.processWebhook({
      provider: 'click',
      transactionId: 'trx-1',
      orderId: 'order-1',
      amount: 1000,
      status: 'success',
      timestamp: new Date().toISOString(),
    });

    expect(service.getWebhookEvents()).toHaveLength(1);
    expect(service.getWebhookEvents()[0].processed).toBe(true);
  });

  it('skips duplicate events already reserved in cache', async () => {
    postSpy.mockResolvedValue({ data: { ok: true } } as never);

    const payload = {
      provider: 'payme',
      transactionId: 'trx-2',
      orderId: 'order-2',
      amount: 2000,
      status: 'pending' as const,
      timestamp: new Date().toISOString(),
    };

    await service.processWebhook(payload);
    await service.processWebhook(payload);

    expect(service.getWebhookEvents()).toHaveLength(1);
    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  it('forwards normalized enterprise webhook envelope using generic forwarding config', async () => {
    postSpy.mockResolvedValue({ data: { ok: true } } as never);

    await service.processWebhook({
      provider: 'uzum',
      transactionId: 'trx-3',
      orderId: 'order-3',
      amount: 3000,
      status: 'cancelled',
      timestamp: '2026-04-15T10:00:00.000Z',
    });

    expect(postSpy).toHaveBeenCalledWith(
      'https://hooks.example.test/payments/webhook',
      expect.objectContaining({
        source: 'my-sdk',
        provider: 'uzum',
        eventType: 'payment.cancelled',
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-MySDK-Provider': 'uzum',
          'X-MySDK-Event-Type': 'payment.cancelled',
        }),
      }),
    );
  });

  it('parses Click raw webhook into canonical payload', () => {
    const payload = {
      click_trans_id: 'click-payment-1',
      service_id: '101202',
      merchant_trans_id: 'order-1',
      amount: '125000',
      action: '1',
      sign_time: '1710000000',
      merchant_prepare_id: 'invoice-7',
    };
    const signString = crypto
      .createHash('md5')
      .update(
        `${payload.click_trans_id}${payload.service_id}click-secret${payload.merchant_trans_id}${payload.merchant_prepare_id}${payload.amount}${payload.action}${payload.sign_time}`,
      )
      .digest('hex');

    const parsed = service.parseClickWebhook({
      ...payload,
      sign_string: signString,
    });

    expect(parsed).toEqual(
      expect.objectContaining({
        provider: 'click',
        transactionId: 'invoice-7',
        orderId: 'order-1',
        amount: 1250,
        status: 'success',
        providerInvoiceId: 'invoice-7',
        providerPaymentId: 'click-payment-1',
        providerStatus: '1',
      }),
    );
  });

  it('parses Payme raw webhook into canonical payload', () => {
    const payload = {
      jsonrpc: '2.0' as const,
      id: 42,
      method: 'PerformTransaction' as const,
      params: {
        id: 'payme-transaction-1',
        time: 1710000000000,
        amount: 500000,
        account: {
          order_id: 'order-77',
        },
      },
    };
    const authorization = `Basic ${Buffer.from('merchant-login:payme-secret').toString('base64')}`;

    const parsed = service.parsePaymeWebhook(payload, authorization);

    expect(parsed).toEqual(
      expect.objectContaining({
        provider: 'payme',
        transactionId: 'payme-transaction-1',
        orderId: 'order-77',
        amount: 5000,
        status: 'success',
        providerPaymentId: 'payme-transaction-1',
        providerStatus: 'PerformTransaction',
      }),
    );
  });
});
