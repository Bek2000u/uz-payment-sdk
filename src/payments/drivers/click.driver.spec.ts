import axios from 'axios';
import * as crypto from 'crypto';
import { ClickDriver } from './click.driver';
import { PaymentConfigService } from '../../config/payment-config.service';
import { ClickError } from '../../errors/ClickError';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ClickDriver', () => {
  let driver: ClickDriver;

  beforeEach(() => {
    jest.clearAllMocks();

    driver = new ClickDriver({
      clickConfig: {
        serviceId: '101202',
        merchantId: 'merchant-1',
        merchantUserId: 'merchant-user-1',
        secretKey: 'click-secret',
        apiUrl: 'https://api.click.uz/v2/merchant',
      },
    } as PaymentConfigService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates invoice via official Merchant API contract', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    mockedAxios.request.mockResolvedValue({
      data: {
        error_code: 0,
        invoice_id: 987654,
      },
    } as any);

    const result = await driver.createPayment({
      orderId: 'order-1',
      amount: 125000,
      phoneNumber: '998901234567',
    });

    const timestampSec = 1710000000;
    const digest = crypto
      .createHash('sha1')
      .update(`${timestampSec}click-secret`)
      .digest('hex');

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        url: 'https://api.click.uz/v2/merchant/invoice/create',
        headers: expect.objectContaining({
          Auth: `merchant-user-1:${digest}:${timestampSec}`,
          Accept: 'application/json',
        }),
        data: {
          service_id: 101202,
          amount: 125000,
          phone_number: '998901234567',
          merchant_trans_id: 'order-1',
        },
      }),
    );

    expect(result.transactionId).toBe('987654');
    expect(result.status).toBe('pending');
  });

  it('checks payment status via official Merchant API contract', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    mockedAxios.request.mockResolvedValue({
      data: {
        error_code: 0,
        invoice_status: 0,
        invoice_status_note: 'Waiting',
      },
    } as any);

    const result = await driver.checkPayment({
      transactionId: '445566',
    });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.click.uz/v2/merchant/invoice/status/101202/445566',
      }),
    );
    expect(result.transactionId).toBe('445566');
    expect(result.status).toBe('pending');
  });

  it('checks payment status by payment id when it is available', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    mockedAxios.request.mockResolvedValue({
      data: {
        error_code: 0,
        payment_id: 445566,
        payment_status: 1,
      },
    } as any);

    const result = await driver.checkPayment({
      paymentId: '445566',
      orderId: 'order-1',
    });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.click.uz/v2/merchant/payment/status/101202/445566',
      }),
    );
    expect(result.transactionId).toBe('445566');
    expect(result.status).toBe('success');
  });

  it('checks payment status by merchant transaction id when date is provided', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000000);
    mockedAxios.request.mockResolvedValue({
      data: {
        error_code: 0,
        payment_id: 778899,
        payment_status: 1,
      },
    } as any);

    const result = await driver.checkPayment({
      orderId: 'order-77',
      paymentDate: '2026-04-22',
    });

    expect(mockedAxios.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: 'https://api.click.uz/v2/merchant/payment/status_by_mti/101202/order-77/2026-04-22',
      }),
    );
    expect(result.transactionId).toBe('778899');
    expect(result.status).toBe('success');
  });

  it('generates hosted click invoice url', () => {
    const url = driver.generateInvoiceUrl({
      amount: 7500,
      orderId: 'order-77',
      returnUrl: 'https://merchant.example/return',
      cardType: 'uzcard',
    });

    expect(url).toBe(
      'https://my.click.uz/services/pay?service_id=101202&merchant_id=merchant-1&amount=7500&transaction_param=order-77&return_url=https%3A%2F%2Fmerchant.example%2Freturn&card_type=uzcard',
    );
  });

  it('throws ClickError on negative api error code', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(1710000000001);
    mockedAxios.request.mockResolvedValue({
      data: {
        error_code: -9,
        error_note: 'Invalid request',
      },
    } as any);

    await expect(
      driver.checkPayment({
        invoiceId: '445566',
      }),
    ).rejects.toEqual(expect.any(ClickError));
  });
});
