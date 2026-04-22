import { PaymentsService } from '../payments.service';
import type { ClickPaymentResult } from '../types/click.types';
import type { PaymePaymentResult } from '../types/payme.types';
import type { UzumPaymentResult } from '../types/uzum.types';

describe('PaymentsService', () => {
  let service: PaymentsService;

  beforeEach(() => {
    service = new PaymentsService({
      providers: {
        payme: {
          merchantId: 'cashbox-1',
          key: 'secret-key',
          apiUrl: 'https://checkout.test.paycom.uz/api',
        },
        click: {
          serviceId: '101202',
          merchantId: 'merchant-1',
          merchantUserId: 'merchant-user-1',
          secretKey: 'click-secret',
          apiUrl: 'https://api.click.uz/v2/merchant',
        },
        uzum: {
          terminalId: 'terminal-1',
          apiKey: 'api-key-1',
          contentLanguage: 'ru',
          apiUrl: 'https://developer.uzumbank.uz',
        },
      },
    });
  });

  it('returns all available providers', () => {
    expect(service.getAvailableProviders()).toEqual(['payme', 'click', 'uzum']);
  });

  it('returns provider info for payme', () => {
    expect(service.getProviderInfo('payme')).toEqual({
      name: 'Payme',
      description: "Payme to'lov tizimi",
      supportedMethods: ['create', 'check', 'cancel'],
      currency: ['UZS'],
      requiredFields: ['amount', 'orderId'],
      optionalFields: ['detail', 'description'],
    });
  });

  it('supports object-style create request', async () => {
    const mockResponse: PaymePaymentResult = {
      success: true,
      provider: 'payme',
      transactionId: 'txn_1',
      status: 'pending',
      orderId: 'test',
    };

    jest
      .spyOn(service.paymeDriver, 'createPayment')
      .mockResolvedValue(mockResponse);

    const result = await service.create({
      provider: 'payme',
      orderId: 'test',
      amount: 1000,
    });

    expect(service.paymeDriver.createPayment).toHaveBeenCalledWith({
      orderId: 'test',
      amount: 1000,
    });
    expect(result).toEqual(mockResponse);
  });

  it('generates payme invoice URL via facade', () => {
    const result = service.generateInvoiceUrl({
      provider: 'payme',
      orderId: 'order-123',
      amount: 500,
      returnUrl: 'https://example.com/return',
    });

    expect(result).toBe(
      'https://test.paycom.uz/bT1jYXNoYm94LTE7YWMub3JkZXJfaWQ9b3JkZXItMTIzO2E9NTAwMDA7Yz1odHRwczovL2V4YW1wbGUuY29tL3JldHVybg==',
    );
  });

  it('generates click invoice URL via facade', () => {
    const result = service.generateInvoiceUrl('click', {
      orderId: 'order-123',
      amount: 500,
      returnUrl: 'https://example.com/return',
      cardType: 'humo',
    });

    expect(result).toBe(
      'https://my.click.uz/services/pay?service_id=101202&merchant_id=merchant-1&amount=50000&transaction_param=order-123&return_url=https%3A%2F%2Fexample.com%2Freturn&card_type=humo',
    );
  });

  it('throws for unsupported invoice provider', () => {
    expect(() =>
      service.generateInvoiceUrl('uzum', {
        orderId: 'order-123',
        amount: 500,
        returnUrl: 'https://example.com/return',
      }),
    ).toThrow('Invoice URL generation is not supported for provider: uzum');
  });

  it('validates required invoice payload fields', () => {
    expect(() =>
      service.generateInvoiceUrl('payme', {
        orderId: 'order-123',
        amount: 500,
      }),
    ).toThrow('Missing required payme invoice fields: returnUrl');
  });

  it('validates required click create payload fields', async () => {
    await expect(
      service.create('click', { orderId: 'o-1', amount: 1000 }),
    ).rejects.toThrow('Missing required click create fields: phoneNumber');
  });

  it('validates uzum redirect requirements', async () => {
    await expect(
      service.create('uzum', { orderId: 'o-1', amount: 1000 }),
    ).rejects.toThrow(
      'Missing required uzum create redirect fields: returnUrl or successUrl+failureUrl',
    );
  });

  it('throws for unsupported provider', async () => {
    await expect(service.create('unknown' as never, {})).rejects.toThrow(
      "Qo'llab-quvvatlanmaydigan provider: unknown",
    );
  });

  it('routes explicit click facade methods to generic provider flow', async () => {
    const mockResponse: ClickPaymentResult = {
      success: true,
      provider: 'click',
      transactionId: 'click-payment-1',
      status: 'success',
    };

    jest
      .spyOn(service.clickDriver, 'cancelPayment')
      .mockResolvedValue(mockResponse);

    const result = await service.cancelClickPayment({
      paymentId: 'click-payment-1',
    });

    expect(service.clickDriver.cancelPayment).toHaveBeenCalledWith({
      paymentId: 'click-payment-1',
    });
    expect(result).toEqual(mockResponse);
  });

  it('routes explicit uzum refund facade to driver method', async () => {
    const mockResponse: UzumPaymentResult = {
      success: true,
      provider: 'uzum',
      transactionId: 'operation-1',
      status: 'refunded',
    };

    jest
      .spyOn(service.uzumDriver, 'refundPayment')
      .mockResolvedValue(mockResponse);

    const result = await service.refundUzumPayment({
      orderId: 'order-1',
      amount: 1000,
    });

    expect(service.uzumDriver.refundPayment).toHaveBeenCalledWith({
      orderId: 'order-1',
      amount: 1000,
    });
    expect(result).toEqual(mockResponse);
  });
});
