import * as crypto from 'crypto';
import { PaymentConfigService } from '../../config/payment-config.service';
import {
  PaymentSdkError,
  PaymentValidationError,
} from '../../errors/PaymentSdkError';
import type { PaymentDriver } from '../../payments/interfaces/payment-driver.interface';
import { postJson } from '../../payments/utils/http-client.util';
import { buildPaymentResult, firstDefined } from '../../payments/utils/normalizers.util';
import { fromProviderAmount, toProviderAmount } from '../../payments/utils/amount.util';
import type { PaymentRequestOptions } from '../../transport/payment-transport';
import type {
  UzumApiResponse,
  UzumCancelPaymentRequest,
  UzumCheckPaymentRequest,
  UzumGetOperationStateRequest,
  UzumGetOrderStatusRequest,
  UzumGetReceiptsRequest,
  UzumGetReceiptsResult,
  UzumMerchantPayRequest,
  UzumMerchantPayResult,
  UzumOperationCommand,
  UzumOperationResult,
  UzumOperationStateResult,
  UzumOrderStatusResult,
  UzumPaymentResult,
  UzumPurchaseReceiptRequest,
  UzumPurchaseReceiptResult,
  UzumRegisterPaymentRequest,
  UzumRegisterPaymentResult,
} from '../../payments/types/uzum.types';

export class UzumClient
  implements
    PaymentDriver<
      UzumRegisterPaymentRequest,
      UzumCheckPaymentRequest,
      UzumCancelPaymentRequest,
      never,
      UzumPaymentResult
    >
{
  constructor(private readonly configService: PaymentConfigService) {}

  private get config() {
    return this.configService.uzumConfig;
  }

  private buildHeaders(extraHeaders: Record<string, string> = {}) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Terminal-Id': this.config.terminalId,
      'X-API-Key': this.config.apiKey,
      'Content-Language': this.config.contentLanguage,
      ...(this.config.merchantAccessToken
        ? { 'X-Merchant-Access-Token': this.config.merchantAccessToken }
        : {}),
      ...extraHeaders,
    };
  }

  private ensureSuccess<T>(
    response: UzumApiResponse<T>,
    context: string,
  ): T {
    if (response?.errorCode === 0 && response.result) {
      return response.result;
    }

    throw new PaymentSdkError(
      `${context} error ${response?.errorCode ?? 'unknown'}: ${response?.message || 'Unknown Uzum API error'}`,
      {
        code: response?.errorCode ?? 'uzum_error',
        provider: 'uzum',
        category: 'provider',
        retryable: false,
        details: response,
      },
    );
  }

  private buildOperationHeaders(operationId?: string) {
    return this.buildHeaders({
      'X-Operation-Id': operationId || crypto.randomUUID(),
    });
  }

  private buildRegisterPayload(data: UzumRegisterPaymentRequest) {
    const successUrl = data.successUrl || data.returnUrl;
    const failureUrl = data.failureUrl || data.returnUrl;

    return {
      amount: toProviderAmount(data.amount),
      clientId: data.clientId || data.orderId,
      currency: Number(data.currencyCode || data.currency || 860),
      paymentDetails: data.paymentDetails || data.description || data.orderId,
      orderNumber: data.orderId,
      successUrl,
      failureUrl,
      viewType: data.viewType || 'REDIRECT',
      sessionTimeoutSecs: Number(data.sessionTimeoutSecs || 1800),
      paymentParams: {
        operationType: data.operationType || 'PAYMENT',
        payType: data.payType || 'ONE_STEP',
        ...(data.phoneNumber ? { phoneNumber: data.phoneNumber } : {}),
        ...(data.force3ds !== undefined ? { force3ds: Boolean(data.force3ds) } : {}),
      },
      ...(data.merchantParams ? { merchantParams: data.merchantParams } : {}),
    };
  }

  async registerPayment(
    data: UzumRegisterPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumRegisterPaymentResult>> {
    return postJson<UzumApiResponse<UzumRegisterPaymentResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/payment/register`,
      this.buildRegisterPayload(data),
      this.buildHeaders(),
      'Uzum payment registration',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }

  async createPayment(
    data: UzumRegisterPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    const response = await this.registerPayment(data, requestOptions);
    const result = this.ensureSuccess(response, 'Uzum payment registration');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.orderId,
      status: 'REGISTERED',
      paymentUrl: result.paymentRedirectUrl,
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      providerInvoiceId: result.orderId,
      checkoutReference: result.orderId,
      providerStatus: 'REGISTERED',
      expiresAt: new Date(
        Date.now() + Number(data.sessionTimeoutSecs || 1800) * 1000,
      ).toISOString(),
      metadata: {
        merchantOrderId: data.orderId,
      },
      message: response.message,
      raw: response,
    });
  }

  async getOrderStatus(
    data: UzumGetOrderStatusRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumOrderStatusResult>> {
    const orderId = data.orderId || data.transactionId;
    if (!orderId) {
      throw new PaymentValidationError(
        'Uzum getOrderStatus requires orderId or transactionId',
        {
          provider: 'uzum',
        },
      );
    }

    return postJson<UzumApiResponse<UzumOrderStatusResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/payment/getOrderStatus`,
      { orderId },
      this.buildHeaders(),
      'Uzum order status check',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }

  async getOperationState(
    data: UzumGetOperationStateRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumOperationStateResult>> {
    return postJson<UzumApiResponse<UzumOperationStateResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/payment/getOperationState`,
      { operationId: data.operationId },
      this.buildHeaders(),
      'Uzum operation state check',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }

  async checkPayment(
    data: UzumCheckPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    const orderId =
      'orderId' in data && data.orderId
        ? data.orderId
        : 'transactionId' in data
          ? data.transactionId
          : undefined;

    if (orderId) {
      const orderStatusResponse = await this.getOrderStatus({
        orderId: String(orderId),
      }, requestOptions);
      const orderResult = this.ensureSuccess(
        orderStatusResponse,
        'Uzum order status check',
      );
      const latestOperation = orderResult.operations?.[0];

      return buildPaymentResult({
        provider: 'uzum',
        transactionId: orderResult.orderId,
        status: orderResult.status,
        amount: fromProviderAmount(orderResult.totalAmount),
        currency: 'UZS',
        orderId: orderResult.merchantOrderId,
        providerInvoiceId: orderResult.orderId,
        providerPaymentId: latestOperation?.operationId || orderResult.orderId,
        checkoutReference: orderResult.orderId,
        providerStatus: orderResult.status,
        metadata: {
          bindingId: orderResult.bindingId,
          operations: orderResult.operations,
          actionCode: orderResult.actionCode,
          cardType: orderResult.cardType,
          completedAmount: fromProviderAmount(orderResult.completedAmount),
          refundedAmount: fromProviderAmount(orderResult.refundedAmount),
          reversedAmount: fromProviderAmount(orderResult.reversedAmount),
        },
        message: firstDefined(
          latestOperation?.actionCodeDescription,
          orderStatusResponse.message,
        ),
        raw: orderStatusResponse,
      });
    }

    if ('operationId' in data && data.operationId) {
      const operationStateResponse = await this.getOperationState({
        operationId: String(data.operationId),
        amount: data.amount,
        orderId: data.orderId,
      }, requestOptions);
      const operationResult = this.ensureSuccess(
        operationStateResponse,
        'Uzum operation state check',
      );

      return buildPaymentResult({
        provider: 'uzum',
        transactionId: operationResult.operation.operationId || String(data.operationId),
        status: operationResult.operation.state,
        amount: data.amount,
        currency: 'UZS',
        orderId: data.orderId,
        providerInvoiceId: data.orderId,
        providerPaymentId:
          operationResult.operation.operationId || String(data.operationId),
        providerStatus: operationResult.operation.state,
        checkoutReference: data.orderId,
        metadata: {
          merchantOperationId: operationResult.operation.merchantOperationId,
          operationType: operationResult.operation.operationType,
          rrn: operationResult.operation.rrn,
        },
        message: firstDefined(
          operationResult.operation.actionCodeDescription,
          operationStateResponse.message,
        ),
        raw: operationStateResponse,
      });
    }

    throw new PaymentValidationError(
      'Uzum payment check requires orderId/transactionId or operationId',
      {
        provider: 'uzum',
      },
    );
  }

  async merchantPay(
    data: UzumMerchantPayRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumMerchantPayResult>> {
    return postJson<UzumApiResponse<UzumMerchantPayResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/payment/merchantPay`,
      {
        processData: data.processData,
        orderId: data.orderId,
        returnUrl: data.returnUrl,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum merchant pay',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }

  async getReceipts(
    data: UzumGetReceiptsRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumGetReceiptsResult>> {
    return postJson<UzumApiResponse<UzumGetReceiptsResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/payment/getReceipts`,
      {
        orderId: data.orderId,
      },
      this.buildHeaders(),
      'Uzum receipts fetch',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }

  async completePayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/acquiring/complete`,
      {
        orderId: data.orderId,
        amount: toProviderAmount(data.amount),
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum complete request',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
    const result = this.ensureSuccess(response, 'Uzum complete request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'COMPLETED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      providerInvoiceId: data.orderId,
      providerPaymentId: result.operationId,
      checkoutReference: data.orderId,
      providerStatus: 'COMPLETED',
      message: response.message,
      raw: response,
    });
  }

  async refundPayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/acquiring/refund`,
      {
        orderId: data.orderId,
        amount: toProviderAmount(data.amount),
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum refund request',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
    const result = this.ensureSuccess(response, 'Uzum refund request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'REFUNDED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      providerInvoiceId: data.orderId,
      providerPaymentId: result.operationId,
      checkoutReference: data.orderId,
      providerStatus: 'REFUNDED',
      message: response.message,
      raw: response,
    });
  }

  async reversePayment(
    data: UzumOperationCommand,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/acquiring/reverse`,
      {
        orderId: data.orderId,
        amount: toProviderAmount(data.amount),
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum reverse request',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
    const result = this.ensureSuccess(response, 'Uzum reverse request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'REVERSED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      providerInvoiceId: data.orderId,
      providerPaymentId: result.operationId,
      checkoutReference: data.orderId,
      providerStatus: 'REVERSED',
      message: response.message,
      raw: response,
    });
  }

  async cancelPayment(
    data: UzumCancelPaymentRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumPaymentResult> {
    return this.reversePayment({
      orderId: data.orderId || data.transactionId!,
      amount: data.amount,
      operationId: data.operationId,
    }, requestOptions);
  }

  async purchaseReceipt(
    data: UzumPurchaseReceiptRequest,
    requestOptions: PaymentRequestOptions = {},
  ): Promise<UzumApiResponse<UzumPurchaseReceiptResult>> {
    return postJson<UzumApiResponse<UzumPurchaseReceiptResult>>(
      this.configService.transport,
      `${this.config.apiUrl}/api/v1/acquiring/purchaseReceipt`,
      {
        orderId: data.orderId,
        cart: data.cart,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum purchase receipt request',
      this.configService.resolveRequestOptions(requestOptions),
      'uzum',
    );
  }
}
