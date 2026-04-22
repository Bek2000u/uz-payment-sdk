import { PaymentConfigService } from '../config/payment-config.service';
import {
  assertServerOnly,
  createPaymentSdkServerServices,
  createPaymentsServiceFromEnv,
  createWebhookServiceFromEnv,
} from './services';
import {
  parseProviderWebhookRequest,
  processProviderWebhookRequest,
  WebhookRequestLike,
} from './request';
import { WebhookService } from '../webhooks/webhook.service';

const createRequest = (
  body: string,
  headers: Record<string, string> = {},
): WebhookRequestLike => ({
  headers: {
    get(name: string) {
      return headers[name.toLowerCase()] || headers[name] || null;
    },
  },
  async text() {
    return body;
  },
});

describe('server helpers', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates payments and webhook services from env-friendly helpers', () => {
    const payments = createPaymentsServiceFromEnv({
      env: {
        PAYME_MERCHANT_ID: 'cashbox-1',
        PAYME_KEY: 'secret-key',
      },
    });
    const webhooks = createWebhookServiceFromEnv({
      env: {
        ENTERPRISE_WEBHOOK_URL: 'https://hooks.example.test/payments',
      },
    });
    const services = createPaymentSdkServerServices({
      env: {
        CLICK_SERVICE_ID: '101202',
        CLICK_SECRET_KEY: 'click-secret',
        CLICK_MERCHANT_ID: 'merchant-1',
      },
    });

    expect(payments.configService).toEqual(expect.any(PaymentConfigService));
    expect(webhooks.configService).toEqual(expect.any(PaymentConfigService));
    expect(services.payments).toEqual(expect.any(Object));
    expect(services.webhooks).toEqual(expect.any(Object));
  });

  it('rejects browser usage for server-only helpers', () => {
    const originalWindow = (globalThis as { window?: unknown }).window;
    (globalThis as { window?: unknown }).window = {};

    try {
      expect(() => assertServerOnly()).toThrow(
        'uz-payment-sdk server helpers can only be used on the server',
      );
    } finally {
      if (originalWindow === undefined) {
        delete (globalThis as { window?: unknown }).window;
      } else {
        (globalThis as { window?: unknown }).window = originalWindow;
      }
    }
  });

  it('parses Click form webhook request with a shared webhook service', async () => {
    const webhookService = new WebhookService({
      providers: {
        click: {
          serviceId: '101202',
          merchantId: 'merchant-1',
          merchantUserId: 'merchant-user-1',
          secretKey: 'click-secret',
          apiUrl: 'https://api.click.uz/v2/merchant',
        },
      },
    });

    jest
      .spyOn(webhookService, 'validateClickSignature')
      .mockReturnValue(true);

    const payload = await parseProviderWebhookRequest({
      provider: 'click',
      request: createRequest(
        'click_trans_id=445566&service_id=101202&merchant_trans_id=order-1&merchant_prepare_id=prepare-1&amount=50000&action=1&sign_time=1710000000&sign_string=ok',
        { 'content-type': 'application/x-www-form-urlencoded' },
      ),
      webhookService,
    });

    expect(payload.provider).toBe('click');
    expect(payload.transactionId).toBe('445566');
    expect(payload.orderId).toBe('order-1');
    expect(payload.amount).toBe(500);
    expect(payload.status).toBe('success');
  });

  it('parses and processes Payme request with authorization header', async () => {
    const webhookService = new WebhookService({
      providers: {
        payme: {
          merchantId: 'cashbox-1',
          key: 'secret-key',
          apiUrl: 'https://checkout.test.paycom.uz/api',
        },
      },
    });

    jest
      .spyOn(webhookService, 'validatePaymeSignature')
      .mockReturnValue(true);
    const processSpy = jest
      .spyOn(webhookService, 'processWebhook')
      .mockResolvedValue(undefined);

    const payload = await processProviderWebhookRequest({
      provider: 'payme',
      request: createRequest(
        JSON.stringify({
          id: 'rpc-1',
          method: 'PerformTransaction',
          params: {
            id: 'txn-1',
            time: 1710000000000,
            amount: 50000,
            account: {
              order_id: 'order-1',
            },
          },
        }),
        {
          'content-type': 'application/json',
          authorization: 'Basic c2lnbmF0dXJl',
        },
      ),
      webhookService,
    });

    expect(payload.provider).toBe('payme');
    expect(payload.transactionId).toBe('txn-1');
    expect(payload.amount).toBe(500);
    expect(processSpy).toHaveBeenCalledWith(payload);
  });
});
