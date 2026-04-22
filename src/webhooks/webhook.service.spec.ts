import axios from 'axios';
import { MemoryCacheStore } from '../cache/cache-store';
import { WebhookService } from './webhook.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('WebhookService', () => {
  let service: WebhookService;

  beforeEach(() => {
    jest.clearAllMocks();

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
    mockedAxios.post.mockResolvedValue({ data: { ok: true } } as never);

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
    mockedAxios.post.mockResolvedValue({ data: { ok: true } } as never);

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
    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  });

  it('forwards normalized enterprise webhook envelope using generic forwarding config', async () => {
    mockedAxios.post.mockResolvedValue({ data: { ok: true } } as never);

    await service.processWebhook({
      provider: 'uzum',
      transactionId: 'trx-3',
      orderId: 'order-3',
      amount: 3000,
      status: 'cancelled',
      timestamp: '2026-04-15T10:00:00.000Z',
    });

    expect(mockedAxios.post).toHaveBeenCalledWith(
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
});
