import axios from 'axios';
import { PaymentConfigService } from '../../config/payment-config.service';
import { UzumDriver } from './uzum.driver';

describe('UzumDriver', () => {
  let driver: UzumDriver;
  let requestSpy: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    jest.clearAllMocks();
    requestSpy = jest.spyOn(axios, 'request');

    driver = new UzumDriver({
      uzumConfig: {
        terminalId: 'terminal-1',
        apiKey: 'api-key-1',
        merchantAccessToken: undefined,
        contentLanguage: 'ru',
        apiUrl: 'https://developer.uzumbank.uz',
      },
    } as PaymentConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers payment via official Checkout API contract', async () => {
    requestSpy.mockResolvedValue({
      data: {
        errorCode: 0,
        message: 'ok',
        result: {
          orderId: 'fb584fdb-48d4-4b50-a7da-f15b9a7ef111',
          paymentRedirectUrl: 'https://checkout.uzum.test/pay/order-1',
        },
      },
    } as any);

    const result = await driver.createPayment({
      orderId: 'order-1',
      amount: 1500,
      returnUrl: 'https://merchant.example/return',
      phoneNumber: '998901234567',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://developer.uzumbank.uz/api/v1/payment/register',
        headers: expect.objectContaining({
          'X-Terminal-Id': 'terminal-1',
          'X-API-Key': 'api-key-1',
          'Content-Language': 'ru',
        }),
        data: expect.objectContaining({
          amount: 150000,
          clientId: 'order-1',
          currency: 860,
          orderNumber: 'order-1',
          successUrl: 'https://merchant.example/return',
          failureUrl: 'https://merchant.example/return',
          viewType: 'REDIRECT',
          sessionTimeoutSecs: 1800,
          paymentParams: expect.objectContaining({
            operationType: 'PAYMENT',
            payType: 'ONE_STEP',
            phoneNumber: '998901234567',
          }),
        }),
      }),
    );

    expect(result.transactionId).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(result.status).toBe('pending');
    expect(result.paymentUrl).toBe('https://checkout.uzum.test/pay/order-1');
    expect(result.amount).toBe(1500);
    expect(result.providerPaymentId).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(result.checkoutReference).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(result.providerStatus).toBe('REGISTERED');
    expect(typeof result.expiresAt).toBe('string');
  });

  it('checks payment via getOrderStatus first', async () => {
    requestSpy.mockResolvedValue({
      data: {
        errorCode: 0,
        message: 'ok',
        result: {
          orderId: 'fb584fdb-48d4-4b50-a7da-f15b9a7ef111',
          status: 'REGISTERED',
          merchantOrderId: 'order-1',
          amount: 150000,
          totalAmount: 150000,
          completedAmount: 0,
          refundedAmount: 0,
          reversedAmount: 0,
          operations: [
            {
              operationId: 'operation-1',
              merchantOperationId: 'merchant-operation-1',
              state: 'IN_PROGRESS',
            },
          ],
        },
      },
    } as any);

    const result = await driver.checkPayment({
      transactionId: 'order-1',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://developer.uzumbank.uz/api/v1/payment/getOrderStatus',
        data: { orderId: 'order-1' },
      }),
    );
    expect(result.transactionId).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(result.orderId).toBe('order-1');
    expect(result.status).toBe('pending');
    expect(result.amount).toBe(1500);
    expect(result.providerPaymentId).toBe('operation-1');
    expect(result.providerStatus).toBe('REGISTERED');
  });

  it('checks operation state when operation id is provided', async () => {
    requestSpy.mockResolvedValue({
      data: {
        errorCode: 0,
        message: 'ok',
        result: {
          operation: {
            operationId: 'operation-2',
            state: 'SUCCESS',
          },
        },
      },
    } as any);

    const result = await driver.checkPayment({
      operationId: 'operation-2',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://developer.uzumbank.uz/api/v1/payment/getOperationState',
        data: { operationId: 'operation-2' },
      }),
    );
    expect(result.status).toBe('success');
    expect(result.providerPaymentId).toBe('operation-2');
    expect(result.providerStatus).toBe('SUCCESS');
  });

  it('requests reverse with X-Operation-Id idempotency header', async () => {
    requestSpy.mockResolvedValue({
      data: {
        errorCode: 0,
        message: 'ok',
        result: {
          operationId: 'refund-operation-1',
        },
      },
    } as any);

    const result = await driver.cancelPayment({
      transactionId: 'order-1',
      amount: 1500,
      operationId: '00000000-0000-4000-8000-000000000001',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://developer.uzumbank.uz/api/v1/acquiring/reverse',
        headers: expect.objectContaining({
          'X-Operation-Id': '00000000-0000-4000-8000-000000000001',
        }),
        data: {
          orderId: 'order-1',
          amount: 150000,
        },
      }),
    );
    expect(result.status).toBe('cancelled');
    expect(result.transactionId).toBe('refund-operation-1');
    expect(result.amount).toBe(1500);
    expect(result.providerPaymentId).toBe('refund-operation-1');
    expect(result.providerStatus).toBe('REVERSED');
  });
});
