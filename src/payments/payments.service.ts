import {
  PaymentConfigService,
  PaymentSdkConfig,
} from '../config/payment-config.service';
import {
  PaymentValidationError,
} from '../errors/PaymentSdkError';
import { maskSensitiveData } from '../logger/sdk-logger';
import { ClickClient } from '../providers/click/click.client';
import { PaymeClient } from '../providers/payme/payme.client';
import { UzumClient } from '../providers/uzum/uzum.client';
import {
  ClickGenerateInvoiceParams,
  GenerateInvoiceParams,
  PaymentAmount,
  PAYMENT_PROVIDERS,
  PaymentProviderId,
  PaymentResult,
  ProviderInfo,
} from './types/payment.types';
import type { PaymentRequestOptions } from '../transport/payment-transport';
import {
  ClickCancelPaymentRequest,
  ClickCheckInvoiceRequest,
  ClickCheckRequest,
  ClickCheckPaymentByMerchantTransIdRequest,
  ClickCheckPaymentRequest,
  ClickCreateInvoiceRequest,
  ClickFiscalDataResponse,
  ClickPaymentResult,
  ClickSubmitFiscalItemsRequest,
  ClickSubmitFiscalQrCodeRequest,
} from './types/click.types';
import {
  PaymeCheckCardRequest,
  PaymeCreateCardRequest,
  PaymeCreateReceiptRequest,
  PaymeGetCardVerifyCodeRequest,
  PaymePayReceiptRequest,
  PaymePaymentResult,
  PaymeReceiptLookupRequest,
  PaymeSendReceiptRequest,
  PaymeSetReceiptFiscalDataRequest,
  PaymeVerifyCardRequest,
} from './types/payme.types';
import {
  UzumCancelPaymentRequest,
  UzumCheckPaymentRequest,
  UzumGetReceiptsRequest,
  UzumMerchantPayRequest,
  UzumOperationCommand,
  UzumPaymentResult,
  UzumPurchaseReceiptRequest,
  UzumRegisterPaymentRequest,
} from './types/uzum.types';

type PaymentOperation = 'create' | 'check' | 'cancel';
type InvoiceCapableProvider = 'payme' | 'click';

type PaymentRequest = {
  provider: PaymentProviderId;
  [key: string]: unknown;
};

export class PaymentsService {
  readonly configService: PaymentConfigService;
  readonly paymeClient: PaymeClient;
  readonly clickClient: ClickClient;
  readonly uzumClient: UzumClient;

  constructor(config: PaymentSdkConfig = {}) {
    this.configService = new PaymentConfigService(config);
    this.paymeClient = new PaymeClient(this.configService);
    this.clickClient = new ClickClient(this.configService);
    this.uzumClient = new UzumClient(this.configService);

    this.configService.logger.info?.('PaymentsService initialized', {
      providers: PAYMENT_PROVIDERS,
    });
  }

  async create(
    providerOrRequest: PaymentProviderId | PaymentRequest,
    maybeData?: Record<string, unknown>,
  ): Promise<PaymentResult> {
    const { provider, data } = this.normalizeRequest(providerOrRequest, maybeData);
    return this.runOperation('create', provider, data);
  }

  async check(
    providerOrRequest: PaymentProviderId | PaymentRequest,
    maybeData?: Record<string, unknown>,
  ): Promise<PaymentResult> {
    const { provider, data } = this.normalizeRequest(providerOrRequest, maybeData);
    return this.runOperation('check', provider, data);
  }

  async cancel(
    providerOrRequest: PaymentProviderId | PaymentRequest,
    maybeData?: Record<string, unknown>,
  ): Promise<PaymentResult> {
    const { provider, data } = this.normalizeRequest(providerOrRequest, maybeData);
    return this.runOperation('cancel', provider, data);
  }

  async createClickInvoice(
    data: ClickCreateInvoiceRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickPaymentResult> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.createPayment(data, requestOptions);
  }

  async checkClickInvoice(
    data: ClickCheckInvoiceRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickPaymentResult> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.checkPayment(data, requestOptions);
  }

  async checkClickPayment(
    data: ClickCheckPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickPaymentResult> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.checkPayment(data, requestOptions);
  }

  async checkClickPaymentByOrder(
    data: ClickCheckPaymentByMerchantTransIdRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickPaymentResult> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.checkPayment(data, requestOptions);
  }

  async cancelClickPayment(
    data: ClickCancelPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickPaymentResult> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.cancelPayment(data, requestOptions);
  }

  async submitClickFiscalItems(
    data: ClickSubmitFiscalItemsRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.submitFiscalItems(data, requestOptions);
  }

  async submitClickFiscalQrCode(
    data: ClickSubmitFiscalQrCodeRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.submitFiscalQrCode(data, requestOptions);
  }

  async getClickFiscalData(
    paymentId: string,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<ClickFiscalDataResponse> {
    this.configService.assertProviderCredentials('click');
    return this.clickClient.getFiscalData(paymentId, requestOptions);
  }

  async createPaymeReceipt(
    data: PaymeCreateReceiptRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<PaymePaymentResult> {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.createPayment(data, requestOptions);
  }

  async checkPaymeReceipt(
    data: PaymeReceiptLookupRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<PaymePaymentResult> {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.checkPayment(data, requestOptions);
  }

  async cancelPaymeReceipt(
    data: PaymeReceiptLookupRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<PaymePaymentResult> {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.cancelPayment(data, requestOptions);
  }

  async getPaymeReceipt(
    data: PaymeReceiptLookupRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.getReceipt(data, requestOptions);
  }

  async sendPaymeReceipt(
    data: PaymeSendReceiptRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.sendReceipt(data, requestOptions);
  }

  async payPaymeReceipt(
    data: PaymePayReceiptRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<PaymePaymentResult> {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.payReceipt(data, requestOptions);
  }

  async setPaymeReceiptFiscalData(
    data: PaymeSetReceiptFiscalDataRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.setReceiptFiscalData(data, requestOptions);
  }

  async createPaymeCard(
    data: PaymeCreateCardRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.createCard(data, requestOptions);
  }

  async requestPaymeCardVerifyCode(
    data: PaymeGetCardVerifyCodeRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.getCardVerifyCode(data, requestOptions);
  }

  async verifyPaymeCard(
    data: PaymeVerifyCardRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.verifyCard(data, requestOptions);
  }

  async checkPaymeCard(
    data: PaymeCheckCardRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('payme');
    return this.paymeClient.checkCard(data, requestOptions);
  }

  async registerUzumPayment(
    data: UzumRegisterPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.createPayment(data, requestOptions);
  }

  async completeUzumPayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.completePayment(data, requestOptions);
  }

  async reverseUzumPayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.cancelPayment(data, requestOptions);
  }

  async refundUzumPayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.refundPayment(data, requestOptions);
  }

  async merchantPayUzum(
    data: UzumMerchantPayRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.merchantPay(data, requestOptions);
  }

  async getUzumReceipts(
    data: UzumGetReceiptsRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.getReceipts(data, requestOptions);
  }

  async purchaseUzumReceipt(
    data: UzumPurchaseReceiptRequest,
    requestOptions: PaymentRequestOptions = {},
  ) {
    this.configService.assertProviderCredentials('uzum');
    return this.uzumClient.purchaseReceipt(data, requestOptions);
  }

  generateInvoiceUrl(
    providerOrRequest: PaymentProviderId | PaymentRequest,
    maybeData?: Record<string, unknown>,
  ): string {
    const { provider, data } = this.normalizeRequest(providerOrRequest, maybeData);
    return this.runInvoiceOperation(provider, data);
  }

  getAvailableProviders(): PaymentProviderId[] {
    return [...PAYMENT_PROVIDERS];
  }

  getProviderInfo(provider: string): ProviderInfo | null {
    const providerInfos: Record<PaymentProviderId, ProviderInfo> = {
      payme: {
        name: 'Payme',
        description: "Payme to'lov tizimi",
        supportedMethods: ['create', 'check', 'cancel'],
        currency: ['UZS'],
        requiredFields: ['amount', 'orderId'],
        optionalFields: ['detail', 'description'],
      },
      click: {
        name: 'Click',
        description: "Click to'lov tizimi",
        supportedMethods: ['create', 'check', 'cancel'],
        currency: ['UZS'],
        requiredFields: ['amount', 'orderId', 'phoneNumber'],
        optionalFields: ['paymentId', 'invoiceId', 'transactionId', 'paymentDate'],
      },
      uzum: {
        name: 'Uzum Checkout',
        description: "Uzum Checkout to'lov tizimi",
        supportedMethods: ['create', 'check', 'cancel'],
        currency: ['UZS'],
        requiredFields: ['amount', 'orderId'],
        optionalFields: [
          'returnUrl',
          'successUrl',
          'failureUrl',
          'description',
          'phoneNumber',
          'viewType',
          'merchantParams',
          'sessionTimeoutSecs',
          'operationType',
          'payType',
        ],
      },
    };

    return providerInfos[provider as PaymentProviderId] || null;
  }

  private async runOperation(
    operation: PaymentOperation,
    provider: PaymentProviderId,
    data: Record<string, unknown>,
  ): Promise<PaymentResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    this.ensureOperationReady(provider, operation, data);

    this.configService.logger.info?.(`Payment ${operation} started`, {
      requestId,
      provider,
      data: maskSensitiveData(data),
    });

    try {
      const result = await this.dispatchOperation(operation, provider, data);
      const duration = Date.now() - startTime;

      this.configService.logger.info?.(`Payment ${operation} completed`, {
        requestId,
        provider,
        duration,
        result: maskSensitiveData(result),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error as Error;

      this.configService.logger.error?.(`Payment ${operation} failed`, {
        requestId,
        provider,
        duration,
        error: err.message,
      });

      throw err;
    }
  }

  private runInvoiceOperation(
    provider: PaymentProviderId,
    data: Record<string, unknown>,
  ): string {
    const requestId = this.generateRequestId();
    this.ensureInvoiceReady(provider, data);

    this.configService.logger.info?.('Payment invoice URL generation started', {
      requestId,
      provider,
      data: maskSensitiveData(data),
    });

    try {
      const invoiceUrl = this.dispatchInvoiceOperation(
        provider as InvoiceCapableProvider,
        data,
      );

      this.configService.logger.info?.('Payment invoice URL generation completed', {
        requestId,
        provider,
      });

      return invoiceUrl;
    } catch (error) {
      const err = error as Error;

      this.configService.logger.error?.('Payment invoice URL generation failed', {
        requestId,
        provider,
        error: err.message,
      });

      throw err;
    }
  }

  private async dispatchOperation(
    operation: PaymentOperation,
    provider: PaymentProviderId,
    data: Record<string, unknown>,
  ): Promise<PaymentResult> {
    switch (provider) {
      case 'payme':
        if (operation === 'cancel') {
          return this.paymeClient.cancelPayment(data as unknown as PaymeReceiptLookupRequest);
        }
        return operation === 'create'
          ? this.paymeClient.createPayment(data as unknown as PaymeCreateReceiptRequest)
          : this.paymeClient.checkPayment(data as unknown as PaymeReceiptLookupRequest);
      case 'click':
        return operation === 'create'
          ? this.clickClient.createPayment(data as unknown as ClickCreateInvoiceRequest)
          : operation === 'check'
            ? this.clickClient.checkPayment(data as unknown as ClickCheckRequest)
            : this.clickClient.cancelPayment(data as unknown as ClickCancelPaymentRequest);
      case 'uzum':
        return operation === 'create'
          ? this.uzumClient.createPayment(data as unknown as UzumRegisterPaymentRequest)
          : operation === 'check'
            ? this.uzumClient.checkPayment(data as unknown as UzumCheckPaymentRequest)
            : this.uzumClient.cancelPayment(data as unknown as UzumCancelPaymentRequest);
      default:
        throw new PaymentValidationError(
          `Qo'llab-quvvatlanmaydigan provider: ${provider}`,
        );
    }
  }

  private dispatchInvoiceOperation(
    provider: InvoiceCapableProvider,
    data: Record<string, unknown>,
  ): string {
    switch (provider) {
      case 'payme':
        return this.paymeClient.generateInvoiceUrl(this.toGenerateInvoiceParams(data));
      case 'click':
        return this.clickClient.generateInvoiceUrl(
          this.toClickGenerateInvoiceParams(data),
        );
      default:
        throw new PaymentValidationError(
          `Invoice URL generation is not supported for provider: ${provider}`,
        );
    }
  }

  private normalizeRequest(
    providerOrRequest: PaymentProviderId | PaymentRequest,
    maybeData?: Record<string, unknown>,
  ): { provider: PaymentProviderId; data: Record<string, unknown> } {
    if (typeof providerOrRequest === 'string') {
      return {
        provider: providerOrRequest,
        data: maybeData || {},
      };
    }

    const { provider, ...data } = providerOrRequest;
    return {
      provider,
      data,
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private ensureOperationReady(
    provider: string,
    operation: PaymentOperation,
    data: Record<string, unknown>,
  ): void {
    if (!PAYMENT_PROVIDERS.includes(provider as PaymentProviderId)) {
      throw new PaymentValidationError(
        `Qo'llab-quvvatlanmaydigan provider: ${provider}`,
      );
    }

    this.configService.assertProviderCredentials(provider as PaymentProviderId);

    const fieldMap: Record<PaymentProviderId, Record<PaymentOperation, string[]>> = {
      payme: {
        create: ['amount', 'orderId'],
        check: ['transactionId'],
        cancel: ['transactionId'],
      },
      click: {
        create: ['amount', 'orderId', 'phoneNumber'],
        check: [],
        cancel: ['paymentId'],
      },
      uzum: {
        create: ['amount', 'orderId'],
        check: [],
        cancel: ['amount'],
      },
    };

    const missingFields = fieldMap[provider as PaymentProviderId][operation].filter(
      (field) => !this.hasValue(data[field]),
    );

    if (missingFields.length > 0) {
      throw new PaymentValidationError(
        `Missing required ${provider} ${operation} fields: ${missingFields.join(', ')}`,
      );
    }

    if (provider === 'click' && operation === 'check') {
      const hasInvoiceLookup = this.hasValue(data.invoiceId) || this.hasValue(data.transactionId);
      const hasPaymentLookup = this.hasValue(data.paymentId);
      const hasMerchantLookup = this.hasValue(data.orderId) && this.hasValue(data.paymentDate);

      if (!hasInvoiceLookup && !hasPaymentLookup && !hasMerchantLookup) {
        throw new PaymentValidationError(
          'Missing required click check fields: paymentId, invoiceId/transactionId, or orderId+paymentDate',
        );
      }
    }

    if (provider === 'uzum' && operation === 'check') {
      const hasOrderLookup = this.hasValue(data.orderId) || this.hasValue(data.transactionId);
      const hasOperationLookup = this.hasValue(data.operationId);

      if (!hasOrderLookup && !hasOperationLookup) {
        throw new PaymentValidationError(
          'Missing required uzum check fields: orderId/transactionId or operationId',
        );
      }
    }

    if (provider === 'uzum' && operation === 'cancel') {
      if (!(this.hasValue(data.orderId) || this.hasValue(data.transactionId))) {
        throw new PaymentValidationError(
          'Missing required uzum cancel fields: orderId or transactionId',
        );
      }
    }

    if (
      provider === 'uzum' &&
      operation === 'create' &&
      !(
        this.hasValue(data.returnUrl) ||
        (this.hasValue(data.successUrl) && this.hasValue(data.failureUrl))
      )
    ) {
      throw new PaymentValidationError(
        'Missing required uzum create redirect fields: returnUrl or successUrl+failureUrl',
      );
    }
  }

  private ensureInvoiceReady(
    provider: string,
    data: Record<string, unknown>,
  ): void {
    if (!PAYMENT_PROVIDERS.includes(provider as PaymentProviderId)) {
      throw new PaymentValidationError(
        `Qo'llab-quvvatlanmaydigan provider: ${provider}`,
      );
    }

    if (provider !== 'payme' && provider !== 'click') {
      throw new PaymentValidationError(
        `Invoice URL generation is not supported for provider: ${provider}`,
      );
    }

    this.configService.assertProviderCredentials(provider as PaymentProviderId);

    const missingFields = ['amount', 'orderId', 'returnUrl'].filter(
      (field) => !this.hasValue(data[field]),
    );

    if (missingFields.length > 0) {
      throw new PaymentValidationError(
        `Missing required ${provider} invoice fields: ${missingFields.join(', ')}`,
      );
    }
  }

  private hasValue(value: unknown): boolean {
    return value !== undefined && value !== null && value !== '';
  }

  private toGenerateInvoiceParams(
    data: Record<string, unknown>,
  ): GenerateInvoiceParams {
    return {
      amount: Number(data.amount) as PaymentAmount,
      orderId: String(data.orderId),
      returnUrl: String(data.returnUrl),
    };
  }

  private toClickGenerateInvoiceParams(
    data: Record<string, unknown>,
  ): ClickGenerateInvoiceParams {
    return {
      ...this.toGenerateInvoiceParams(data),
      ...(this.hasValue(data.cardType) ? { cardType: String(data.cardType) } : {}),
    };
  }
}
