import { PaymentConfigService } from '../../config/payment-config.service';
import type { PaymentDriver } from '../../payments/interfaces/payment-driver.interface';
import { buildPaymentResult, firstDefined } from '../../payments/utils/normalizers.util';
import { postJson } from '../../payments/utils/http-client.util';
import type {
  GenerateInvoiceParams,
} from '../../payments/types/payment.types';
import {
  generateBasicAuthHeader,
  generatePaymeXAuthHeader,
} from '../../payments/utils/signer.util';
import { PaymeError } from '../../errors/PaymeError';
import { generatePaymeInvoiceUrl } from '../../payments/utils/invoice.util';
import { fromProviderAmount, toProviderAmount } from '../../payments/utils/amount.util';
import type {
  PaymeCheckCardRequest,
  PaymeCreateCardRequest,
  PaymeCreateReceiptRequest,
  PaymeCardTokenResult,
  PaymeGetCardVerifyCodeRequest,
  PaymeJsonRpcResponse,
  PaymeJsonRpcSuccess,
  PaymePayReceiptRequest,
  PaymeReceipt,
  PaymeReceiptEnvelope,
  PaymeReceiptLookupRequest,
  PaymePaymentResult,
  PaymeSendReceiptRequest,
  PaymeSendReceiptResult,
  PaymeSetReceiptFiscalDataRequest,
  PaymeVerifyCardRequest,
} from '../../payments/types/payme.types';

export class PaymeClient
  implements
    PaymentDriver<
      PaymeCreateReceiptRequest,
      PaymeReceiptLookupRequest,
      PaymeReceiptLookupRequest,
      GenerateInvoiceParams,
      PaymePaymentResult
    >
{
  constructor(private readonly configService: PaymentConfigService) {}

  private ensurePaymeSuccess<TResult>(
    response: PaymeJsonRpcResponse<TResult>,
  ): asserts response is PaymeJsonRpcSuccess<TResult> {
    if ('error' in response && response.error) {
      throw PaymeError.fromJsonRpcError(response.error);
    }
  }

  private async call<TResult>(
    method: string,
    params: Record<string, unknown>,
  ): Promise<PaymeJsonRpcSuccess<TResult>> {
    const config = this.configService.paymeConfig;
    const response = await postJson<PaymeJsonRpcResponse<TResult>>(
      config.apiUrl,
      {
        id: Date.now(),
        method,
        params,
      },
      {
        'Content-Type': 'application/json',
        'X-Auth': generatePaymeXAuthHeader(config.merchantId, config.key),
      },
      `Payme ${method}`,
    );

    this.ensurePaymeSuccess(response);
    return response;
  }

  async createReceipt(
    data: PaymeCreateReceiptRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeReceiptEnvelope>> {
    const { orderId, amount, detail, description } = data;
    return this.call<PaymeReceiptEnvelope>('receipts.create', {
      amount: toProviderAmount(amount),
      account: {
        order_id: orderId,
      },
      ...(detail ? { detail } : {}),
      ...(description ? { description } : {}),
    });
  }

  async createPayment(
    data: PaymeCreateReceiptRequest,
  ): Promise<PaymePaymentResult> {
    const { orderId, amount } = data;
    const response = await this.createReceipt(data);
    const receipt = response.result.receipt;
    const providerPaymentId =
      firstDefined(receipt?._id, receipt?.id, orderId) || orderId;

    return buildPaymentResult({
      provider: 'payme',
      transactionId: providerPaymentId,
      status: firstDefined(
        receipt?.state,
        0,
      ),
      amount,
      orderId,
      providerPaymentId,
      providerInvoiceId: providerPaymentId,
      checkoutReference: providerPaymentId,
      providerStatus:
        receipt?.state !== undefined ? String(receipt.state) : undefined,
      metadata: receipt?.meta || receipt?.detail || undefined,
      message: receipt?.description,
      raw: response,
    });
  }

  async checkReceipt(
    data: PaymeReceiptLookupRequest,
  ): Promise<PaymeJsonRpcSuccess<{ state?: number; receipt?: PaymeReceipt }>> {
    return this.call<{ state?: number; receipt?: PaymeReceipt }>('receipts.check', {
      id: data.transactionId,
    });
  }

  async checkPayment(
    data: PaymeReceiptLookupRequest,
  ): Promise<PaymePaymentResult> {
    const { transactionId } = data;
    const response = await this.checkReceipt(data);
    const receipt = response?.result?.receipt;
    return buildPaymentResult({
      provider: 'payme',
      transactionId,
      status: firstDefined(response?.result?.state, receipt?.state),
      orderId: this.extractOrderId(receipt),
      amount: fromProviderAmount(receipt?.amount),
      providerPaymentId: transactionId,
      providerInvoiceId: transactionId,
      providerStatus:
        firstDefined(response?.result?.state, receipt?.state) !== undefined
          ? String(firstDefined(response?.result?.state, receipt?.state))
          : undefined,
      metadata: receipt?.meta || receipt?.detail || undefined,
      raw: response,
    });
  }

  async getReceipt(
    data: PaymeReceiptLookupRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeReceiptEnvelope>> {
    return this.call<PaymeReceiptEnvelope>('receipts.get', {
      id: data.transactionId,
    });
  }

  async cancelReceipt(
    data: PaymeReceiptLookupRequest,
  ): Promise<PaymePaymentResult> {
    const response = await this.call<PaymeReceiptEnvelope>('receipts.cancel', {
      id: data.transactionId,
    });
    const receipt = response.result.receipt;
    const providerPaymentId =
      firstDefined(receipt?._id, receipt?.id, data.transactionId) || data.transactionId;

    return buildPaymentResult({
      provider: 'payme',
      transactionId: providerPaymentId,
      status: firstDefined(receipt?.state, 21),
      amount: fromProviderAmount(receipt?.amount),
      orderId: this.extractOrderId(receipt),
      providerPaymentId,
      providerInvoiceId: providerPaymentId,
      providerStatus:
        receipt?.state !== undefined ? String(receipt.state) : undefined,
      metadata: receipt?.meta || receipt?.detail || undefined,
      message: receipt?.description,
      raw: response,
    });
  }

  async sendReceipt(
    data: PaymeSendReceiptRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeSendReceiptResult>> {
    return this.call<PaymeSendReceiptResult>('receipts.send', {
      id: data.transactionId,
      phone: data.phone,
    });
  }

  async payReceipt(
    data: PaymePayReceiptRequest,
  ): Promise<PaymePaymentResult> {
    const response = await this.call<PaymeReceiptEnvelope>('receipts.pay', {
      id: data.transactionId,
      token: data.token,
      ...(data.payer ? { payer: data.payer } : {}),
      ...(data.hold !== undefined ? { hold: data.hold } : {}),
    });
    const receipt = response.result.receipt;
    const providerPaymentId =
      firstDefined(receipt?._id, receipt?.id, data.transactionId) || data.transactionId;

    return buildPaymentResult({
      provider: 'payme',
      transactionId: providerPaymentId,
      status: receipt?.state,
      amount: fromProviderAmount(receipt?.amount),
      orderId: this.extractOrderId(receipt),
      providerPaymentId,
      providerInvoiceId: providerPaymentId,
      providerStatus:
        receipt?.state !== undefined ? String(receipt.state) : undefined,
      metadata: receipt?.meta || receipt?.detail || undefined,
      message: receipt?.description,
      raw: response,
    });
  }

  async setReceiptFiscalData(
    data: PaymeSetReceiptFiscalDataRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeReceiptEnvelope>> {
    return this.call<PaymeReceiptEnvelope>('receipts.set_fiscal_data', {
      id: data.transactionId,
      fiscal_data: data.fiscalData,
    });
  }

  async createCard(
    data: PaymeCreateCardRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeCardTokenResult>> {
    return this.call<PaymeCardTokenResult>('cards.create', {
      card: {
        number: data.number,
        expire: data.expire,
      },
      ...(data.save !== undefined ? { save: data.save } : {}),
    });
  }

  async getCardVerifyCode(
    data: PaymeGetCardVerifyCodeRequest,
  ): Promise<PaymeJsonRpcSuccess<{ sent?: boolean }>> {
    return this.call<{ sent?: boolean }>('cards.get_verify_code', {
      token: data.token,
    });
  }

  async verifyCard(
    data: PaymeVerifyCardRequest,
  ): Promise<PaymeJsonRpcSuccess<PaymeCardTokenResult>> {
    return this.call<PaymeCardTokenResult>('cards.verify', {
      token: data.token,
      code: data.code,
    });
  }

  async checkCard(
    data: PaymeCheckCardRequest,
  ): Promise<PaymeJsonRpcSuccess<{ card?: PaymeCardTokenResult['card']; verify?: boolean }>> {
    return this.call<{ card?: PaymeCardTokenResult['card']; verify?: boolean }>(
      'cards.check',
      {
        token: data.token,
      },
    );
  }

  async cancelPayment(
    data: PaymeReceiptLookupRequest,
  ): Promise<PaymePaymentResult> {
    return this.cancelReceipt(data);
  }

  validateAuthorizationHeader(authorization?: string): boolean {
    if (!authorization) {
      return false;
    }

    const config = this.configService.paymeConfig;
    const expected = generateBasicAuthHeader(
      config.login || config.merchantId,
      config.key!,
    );

    return authorization === expected;
  }

  private extractOrderId(receipt?: PaymeReceipt): string | undefined {
    if (!receipt?.account) {
      return undefined;
    }

    if (Array.isArray(receipt.account)) {
      return receipt.account.find((entry) => entry.name === 'order_id')?.value;
    }

    return receipt.account.order_id;
  }

  generateInvoiceUrl(params: GenerateInvoiceParams): string {
    const config = this.configService.paymeConfig;

    return generatePaymeInvoiceUrl({
      merchantId: config.merchantId,
      amount: toProviderAmount(params.amount),
      orderId: params.orderId,
      returnUrl: params.returnUrl,
      apiUrl: config.apiUrl,
    });
  }
}
