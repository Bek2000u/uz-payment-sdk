import axios from 'axios';
import { PaymeDriver } from './payme.driver';
import { PaymentConfigService } from '../../config/payment-config.service';
import { PaymeError } from '../../errors/PaymeError';

describe('PaymeDriver', () => {
  let driver: PaymeDriver;
  let requestSpy: jest.SpiedFunction<typeof axios.request>;

  beforeEach(() => {
    jest.clearAllMocks();
    requestSpy = jest.spyOn(axios, 'request');

    driver = new PaymeDriver({
      paymeConfig: {
        merchantId: 'cashbox-1',
        login: 'merchant-login',
        key: 'secret-key',
        apiUrl: 'https://checkout.test.paycom.uz/api',
      },
    } as PaymentConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates receipt via Subscribe API with X-Auth header', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    requestSpy.mockResolvedValue({
      data: {
        result: {
          receipt: {
            _id: 'receipt-1',
            state: 0,
            meta: {
              source: 'checkout',
            },
          },
        },
      },
    } as any);

    const result = await driver.createPayment({
      orderId: 'order-1',
      amount: 5000,
      detail: { receipt_type: 0 },
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://checkout.test.paycom.uz/api',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Auth': 'cashbox-1:secret-key',
        }),
        data: expect.objectContaining({
          id: 1710000000000,
          method: 'receipts.create',
          params: expect.objectContaining({
            amount: 500000,
            account: { order_id: 'order-1' },
            detail: { receipt_type: 0 },
          }),
        }),
      }),
    );

    expect(result.transactionId).toBe('receipt-1');
    expect(result.status).toBe('pending');
    expect(result.amount).toBe(5000);
    expect(result.providerPaymentId).toBe('receipt-1');
    expect(result.providerInvoiceId).toBe('receipt-1');
    expect(result.metadata).toEqual({ source: 'checkout' });
  });

  it('checks receipt state via Subscribe API', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000001);
    requestSpy.mockResolvedValue({
      data: {
        result: {
          state: 4,
          receipt: {
            amount: 500000,
            account: { order_id: 'order-1' },
            detail: { origin: 'merchant' },
          },
        },
      },
    } as any);

    const result = await driver.checkPayment({
      transactionId: 'receipt-1',
    });

    expect(requestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://checkout.test.paycom.uz/api',
        data: {
          id: 1710000000001,
          method: 'receipts.check',
          params: { id: 'receipt-1' },
        },
      }),
    );
    expect(result.status).toBe('success');
    expect(result.orderId).toBe('order-1');
    expect(result.amount).toBe(5000);
    expect(result.providerPaymentId).toBe('receipt-1');
    expect(result.providerStatus).toBe('4');
    expect(result.metadata).toEqual({ origin: 'merchant' });
  });

  it('generates hosted checkout invoice url', () => {
    const url = driver.generateInvoiceUrl({
      amount: 50,
      orderId: 'order-42',
      returnUrl: 'https://merchant.example/success',
    });

    expect(url.startsWith('https://test.paycom.uz/')).toBe(true);
    expect(url).toContain('bT1jYXNoYm94LTE7YWMub3JkZXJfaWQ9b3JkZXItNDI7YT01MDAwO2M9aHR0cHM6Ly9tZXJjaGFudC5leGFtcGxlL3N1Y2Nlc3M=');
  });

  it('throws PaymeError on JSON-RPC error payload', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000002);
    requestSpy.mockResolvedValue({
      data: {
        error: {
          code: -31050,
          message: {
            en: 'Order not found',
          },
        },
      },
    } as any);

    await expect(
      driver.checkPayment({
        transactionId: 'missing-receipt',
      }),
    ).rejects.toEqual(expect.any(PaymeError));
  });
});
