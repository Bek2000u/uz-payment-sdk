import { PaymentConfigService } from '../config/payment-config.service';
import { PaymeClient } from '../providers/payme/payme.client';
import type {
  PaymentTransport,
  PaymentTransportRequest,
} from '../transport/payment-transport';

describe('Transport integration contract', () => {
  it('passes provider, signal, timeout and retry options to injected transport', async () => {
    const capturedRequests: PaymentTransportRequest[] = [];
    const transport: PaymentTransport = {
      async request<TResponse>(request: PaymentTransportRequest) {
        capturedRequests.push(request);
        return {
          data: {
            result: {
              receipt: {
                _id: 'receipt-transport-1',
                state: 0,
              },
            },
          } as TResponse,
          status: 200,
        };
      },
    };

    const signalController = new AbortController();
    const client = new PaymeClient(
      new PaymentConfigService({
        transport,
        providers: {
          payme: {
            merchantId: 'cashbox-1',
            key: 'secret-key',
            apiUrl: 'https://checkout.test.paycom.uz/api',
          },
        },
      }),
    );

    const result = await client.createPayment(
      {
        orderId: 'order-transport-1',
        amount: 500,
      },
      {
        signal: signalController.signal,
        timeoutMs: 4321,
        retry: {
          attempts: 2,
          baseDelayMs: 10,
        },
      },
    );

    expect(capturedRequests).toHaveLength(1);
    expect(capturedRequests[0]).toEqual(
      expect.objectContaining({
        provider: 'payme',
        timeoutMs: 4321,
        signal: signalController.signal,
        retry: {
          attempts: 2,
          baseDelayMs: 10,
        },
      }),
    );
    expect(result.transactionId).toBe('receipt-transport-1');
    expect(result.requiresAction).toBe(true);
  });
});
