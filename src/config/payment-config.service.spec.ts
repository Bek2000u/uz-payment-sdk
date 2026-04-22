import { PaymentConfigService } from './payment-config.service';

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
});
