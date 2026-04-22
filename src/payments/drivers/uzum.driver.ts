import * as crypto from 'crypto';
import { PaymentConfigService } from '../../config/payment-config.service';
import { PaymentDriver } from '../interfaces/payment-driver.interface';
import { PaymentResult } from '../types/payment.types';
import { postJson } from '../utils/http-client.util';
import { buildPaymentResult, firstDefined } from '../utils/normalizers.util';
import {
  UzumApiResponse,
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
  UzumPurchaseReceiptRequest,
  UzumPurchaseReceiptResult,
  UzumRegisterPaymentRequest,
  UzumRegisterPaymentResult,
} from '../types/uzum.types';

export class UzumDriver implements PaymentDriver {
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

    throw new Error(
      `${context} error ${response?.errorCode ?? 'unknown'}: ${response?.message || 'Unknown Uzum API error'}`,
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
      amount: data.amount,
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
  ): Promise<UzumApiResponse<UzumRegisterPaymentResult>> {
    return postJson<UzumApiResponse<UzumRegisterPaymentResult>>(
      `${this.config.apiUrl}/api/v1/payment/register`,
      this.buildRegisterPayload(data),
      this.buildHeaders(),
      'Uzum payment registration',
    );
  }

  async createPayment(
    data: UzumRegisterPaymentRequest,
  ): Promise<PaymentResult> {
    const response = await this.registerPayment(data);
    const result = this.ensureSuccess(response, 'Uzum payment registration');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.orderId,
      status: 'REGISTERED',
      paymentUrl: result.paymentRedirectUrl,
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      message: response.message,
      raw: response,
    });
  }

  async getOrderStatus(
    data: UzumGetOrderStatusRequest,
  ): Promise<UzumApiResponse<UzumOrderStatusResult>> {
    const orderId = data.orderId || data.transactionId;
    if (!orderId) {
      throw new Error('Uzum getOrderStatus requires orderId or transactionId');
    }

    return postJson<UzumApiResponse<UzumOrderStatusResult>>(
      `${this.config.apiUrl}/api/v1/payment/getOrderStatus`,
      { orderId },
      this.buildHeaders(),
      'Uzum order status check',
    );
  }

  async getOperationState(
    data: UzumGetOperationStateRequest,
  ): Promise<UzumApiResponse<UzumOperationStateResult>> {
    return postJson<UzumApiResponse<UzumOperationStateResult>>(
      `${this.config.apiUrl}/api/v1/payment/getOperationState`,
      { operationId: data.operationId },
      this.buildHeaders(),
      'Uzum operation state check',
    );
  }

  async checkPayment(data: any): Promise<PaymentResult> {
    const orderId = data.orderId || data.transactionId;

    if (orderId) {
      const orderStatusResponse = await this.getOrderStatus({
        orderId: String(orderId),
      });
      const orderResult = this.ensureSuccess(
        orderStatusResponse,
        'Uzum order status check',
      );
      const latestOperation = orderResult.operations?.[0];

      return buildPaymentResult({
        provider: 'uzum',
        transactionId: orderResult.orderId,
        status: orderResult.status,
        amount: orderResult.totalAmount,
        currency: 'UZS',
        orderId: orderResult.merchantOrderId,
        message: firstDefined(
          latestOperation?.actionCodeDescription,
          orderStatusResponse.message,
        ),
        raw: orderStatusResponse,
      });
    }

    if (data.operationId) {
      const operationStateResponse = await this.getOperationState({
        operationId: String(data.operationId),
        amount: data.amount,
        orderId: data.orderId,
      });
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
        message: firstDefined(
          operationResult.operation.actionCodeDescription,
          operationStateResponse.message,
        ),
        raw: operationStateResponse,
      });
    }

    throw new Error('Uzum payment check requires orderId/transactionId or operationId');
  }

  async merchantPay(
    data: UzumMerchantPayRequest,
  ): Promise<UzumApiResponse<UzumMerchantPayResult>> {
    return postJson<UzumApiResponse<UzumMerchantPayResult>>(
      `${this.config.apiUrl}/api/v1/payment/merchantPay`,
      {
        processData: data.processData,
        orderId: data.orderId,
        returnUrl: data.returnUrl,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum merchant pay',
    );
  }

  async getReceipts(
    data: UzumGetReceiptsRequest,
  ): Promise<UzumApiResponse<UzumGetReceiptsResult>> {
    return postJson<UzumApiResponse<UzumGetReceiptsResult>>(
      `${this.config.apiUrl}/api/v1/payment/getReceipts`,
      {
        orderId: data.orderId,
      },
      this.buildHeaders(),
      'Uzum receipts fetch',
    );
  }

  async completePayment(
    data: UzumOperationCommand,
  ): Promise<PaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      `${this.config.apiUrl}/api/v1/acquiring/complete`,
      {
        orderId: data.orderId,
        amount: data.amount,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum complete request',
    );
    const result = this.ensureSuccess(response, 'Uzum complete request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'COMPLETED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      message: response.message,
      raw: response,
    });
  }

  async refundPayment(
    data: UzumOperationCommand,
  ): Promise<PaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      `${this.config.apiUrl}/api/v1/acquiring/refund`,
      {
        orderId: data.orderId,
        amount: data.amount,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum refund request',
    );
    const result = this.ensureSuccess(response, 'Uzum refund request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'REFUNDED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      message: response.message,
      raw: response,
    });
  }

  async reversePayment(
    data: UzumOperationCommand,
  ): Promise<PaymentResult> {
    const response = await postJson<UzumApiResponse<UzumOperationResult>>(
      `${this.config.apiUrl}/api/v1/acquiring/reverse`,
      {
        orderId: data.orderId,
        amount: data.amount,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum reverse request',
    );
    const result = this.ensureSuccess(response, 'Uzum reverse request');

    return buildPaymentResult({
      provider: 'uzum',
      transactionId: result.operationId,
      status: 'REVERSED',
      amount: data.amount,
      currency: 'UZS',
      orderId: data.orderId,
      message: response.message,
      raw: response,
    });
  }

  async cancelPayment(
    data: { orderId?: string; transactionId?: string; amount: number; operationId?: string },
  ): Promise<PaymentResult> {
    return this.reversePayment({
      orderId: data.orderId || data.transactionId!,
      amount: data.amount,
      operationId: data.operationId,
    });
  }

  async purchaseReceipt(
    data: UzumPurchaseReceiptRequest,
  ): Promise<UzumApiResponse<UzumPurchaseReceiptResult>> {
    return postJson<UzumApiResponse<UzumPurchaseReceiptResult>>(
      `${this.config.apiUrl}/api/v1/acquiring/purchaseReceipt`,
      {
        orderId: data.orderId,
        cart: data.cart,
      },
      this.buildOperationHeaders(data.operationId),
      'Uzum purchase receipt request',
    );
  }
}
