import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { PaymentConfigService } from '../config/payment-config.service';
import { ClickClient } from '../providers/click/click.client';
import { PaymeClient } from '../providers/payme/payme.client';
import { UzumClient } from '../providers/uzum/uzum.client';

const loadFixture = <T>(relativePath: string): T => {
  const fixturePath = path.join(__dirname, 'fixtures', relativePath);
  return JSON.parse(fs.readFileSync(fixturePath, 'utf8')) as T;
};

describe('Provider contract fixtures', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps Payme receipt check fixture into normalized SDK result', async () => {
    const requestSpy = jest.spyOn(axios, 'request').mockResolvedValue({
      data: loadFixture('payme/receipts-check-success.json'),
    } as any);

    const client = new PaymeClient(
      new PaymentConfigService({
        providers: {
          payme: {
            merchantId: 'cashbox-1',
            key: 'secret-key',
            apiUrl: 'https://checkout.test.paycom.uz/api',
          },
        },
      }),
    );

    const result = await client.checkPayment({ transactionId: 'receipt-1' });

    expect(requestSpy).toHaveBeenCalled();
    expect(result.status).toBe('success');
    expect(result.success).toBe(true);
    expect(result.amount).toBe(5000);
    expect(result.orderId).toBe('order-1');
    expect(result.providerPaymentId).toBe('receipt-1');
    expect(result.providerStatus).toBe('4');
  });

  it('maps Click invoice and payment fixtures into stable ids', async () => {
    const requestSpy = jest.spyOn(axios, 'request');
    requestSpy
      .mockResolvedValueOnce({
        data: loadFixture('click/invoice-status-pending.json'),
      } as any)
      .mockResolvedValueOnce({
        data: loadFixture('click/payment-status-success.json'),
      } as any);

    const client = new ClickClient(
      new PaymentConfigService({
        providers: {
          click: {
            serviceId: '101202',
            merchantId: 'merchant-1',
            merchantUserId: 'merchant-user-1',
            secretKey: 'click-secret',
            apiUrl: 'https://api.click.uz/v2/merchant',
          },
        },
      }),
    );

    const invoice = await client.checkPayment({ transactionId: '445566' });
    const payment = await client.checkPayment({
      paymentId: '445566',
      orderId: 'order-1',
    });

    expect(invoice.status).toBe('pending');
    expect(invoice.providerInvoiceId).toBe('445566');
    expect(invoice.providerPaymentId).toBeUndefined();
    expect(payment.status).toBe('success');
    expect(payment.providerPaymentId).toBe('445566');
    expect(payment.transactionId).toBe('445566');
  });

  it('maps Uzum order and operation fixtures into normalized checkout fields', async () => {
    const requestSpy = jest.spyOn(axios, 'request');
    requestSpy
      .mockResolvedValueOnce({
        data: loadFixture('uzum/order-status-registered.json'),
      } as any)
      .mockResolvedValueOnce({
        data: loadFixture('uzum/operation-state-success.json'),
      } as any);

    const client = new UzumClient(
      new PaymentConfigService({
        providers: {
          uzum: {
            terminalId: 'terminal-1',
            apiKey: 'api-key-1',
            contentLanguage: 'ru',
            apiUrl: 'https://developer.uzumbank.uz',
          },
        },
      }),
    );

    const order = await client.checkPayment({ transactionId: 'order-1' });
    const operation = await client.checkPayment({ operationId: 'operation-2' });

    expect(order.status).toBe('pending');
    expect(order.amount).toBe(1500);
    expect(order.providerInvoiceId).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(order.providerPaymentId).toBe('operation-1');
    expect(order.checkoutReference).toBe('fb584fdb-48d4-4b50-a7da-f15b9a7ef111');
    expect(order.metadata).toEqual(
      expect.objectContaining({
        bindingId: 'binding-1',
        cardType: 'UZCARD',
      }),
    );

    expect(operation.status).toBe('success');
    expect(operation.success).toBe(true);
    expect(operation.providerPaymentId).toBe('operation-2');
    expect(operation.providerStatus).toBe('SUCCESS');
    expect(operation.metadata).toEqual(
      expect.objectContaining({
        rrn: 'rrn-1',
      }),
    );
  });
});
