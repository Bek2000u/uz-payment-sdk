import { PaymentConfigService } from './payment-config.service';
import type { PaymentTransport } from '../transport/payment-transport';

describe('PaymentConfigService', () => {
  it('uses generic enterprise webhook forwarding defaults', () => {
    const service = new PaymentConfigService({
      env: {
        ENTERPRISE_WEBHOOK_URL: 'https://hooks.example.test/payments',
      },
    });

    expect(service.enterpriseWebhookForwardingConfig).toEqual({
      enabled: true,
      url: 'https://hooks.example.test/payments',
      secret: undefined,
      timeoutMs: 5000,
      source: 'payment-sdk',
      headerPrefix: 'X-Payment-SDK',
    });
  });

  it('prefers explicit generic enterprise webhook forwarding config', () => {
    const service = new PaymentConfigService({
      env: {
        ENTERPRISE_WEBHOOK_URL: 'https://hooks.example.test/env',
        ENTERPRISE_WEBHOOK_SOURCE: 'env-sdk',
      },
      enterpriseWebhookForwarding: {
        enabled: true,
        url: 'https://hooks.example.test/explicit',
        secret: 'secret-1',
        timeoutMs: 9000,
        source: 'custom-sdk',
        headerPrefix: 'X-Custom-SDK',
      },
    });

    expect(service.enterpriseWebhookForwardingConfig).toEqual({
      enabled: true,
      url: 'https://hooks.example.test/explicit',
      secret: 'secret-1',
      timeoutMs: 9000,
      source: 'custom-sdk',
      headerPrefix: 'X-Custom-SDK',
    });
  });

  it('merges request defaults with per-call overrides', () => {
    const service = new PaymentConfigService({
      env: {
        PAYMENT_HTTP_TIMEOUT_MS: '12000',
      },
      requestDefaults: {
        timeoutMs: 7000,
        retry: 2,
      },
    });

    expect(
      service.resolveRequestOptions({
        retry: {
          attempts: 4,
        },
      }),
    ).toEqual({
      timeoutMs: 7000,
      retry: {
        attempts: 4,
      },
      signal: undefined,
    });
  });

  it('uses injected transport when provided', async () => {
    const transport: PaymentTransport = {
      async request<TResponse>() {
        return {
          data: { ok: true } as TResponse,
          status: 200,
        };
      },
    };

    const service = new PaymentConfigService({
      transport,
    });

    expect(await service.transport.request({} as never)).toEqual({
      data: { ok: true },
      status: 200,
    });
  });
});
