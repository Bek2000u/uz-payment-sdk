import * as crypto from 'crypto';
import { PaymentConfigService } from '../../config/payment-config.service';
import type { PaymentDriver } from '../../payments/interfaces/payment-driver.interface';
import { buildPaymentResult } from '../../payments/utils/normalizers.util';
import { deleteJson, getJson, postJson } from '../../payments/utils/http-client.util';
import type { ClickGenerateInvoiceParams } from '../../payments/types/payment.types';
import { generateClickMerchantAuthHeader } from '../../payments/utils/signer.util';
import { ClickError } from '../../errors/ClickError';
import { generateClickInvoiceUrl } from '../../payments/utils/invoice.util';
import { toProviderAmount } from '../../payments/utils/amount.util';
import type {
  ClickApiResponseBase,
  ClickCancelPaymentRequest,
  ClickCheckRequest,
  ClickCreateInvoiceRequest,
  ClickCreateInvoiceResponse,
  ClickFiscalDataResponse,
  ClickInvoiceStatusResponse,
  ClickPaymentResult,
  ClickPaymentStatusResponse,
  ClickPaymentReversalResponse,
  ClickSubmitFiscalItemsRequest,
  ClickSubmitFiscalQrCodeRequest,
} from '../../payments/types/click.types';

type ClickConfig = PaymentConfigService['clickConfig'];

export class ClickClient
  implements
    PaymentDriver<
      ClickCreateInvoiceRequest,
      ClickCheckRequest,
      ClickCancelPaymentRequest,
      ClickGenerateInvoiceParams,
      ClickPaymentResult
    >
{
  private readonly config: ClickConfig;

  constructor(private readonly configService: PaymentConfigService) {
    this.config = this.configService.clickConfig;
  }

  private buildMerchantHeaders(timestampSec: number) {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Auth: generateClickMerchantAuthHeader(
        this.config.merchantUserId,
        this.config.secretKey,
        timestampSec,
      ),
    };
  }

  private mapClickMerchantStatus(
    paymentStatus: unknown,
    errorCode?: number,
  ): 'pending' | 'success' | 'cancelled' | 'failed' | 'unknown' {
    if (typeof errorCode === 'number' && errorCode !== 0) {
      return 'failed';
    }

    if (paymentStatus === 1 || paymentStatus === '1') {
      return 'success';
    }

    if (paymentStatus === 0 || paymentStatus === '0') {
      return 'pending';
    }

    if (
      paymentStatus === -1 ||
      paymentStatus === '-1' ||
      paymentStatus === -99 ||
      paymentStatus === '-99'
    ) {
      return 'cancelled';
    }

    return 'unknown';
  }

  private ensureClickSuccess(response: ClickApiResponseBase): void {
    if (typeof response?.error_code === 'number' && response.error_code < 0) {
      throw new ClickError(
        response.error_note || 'Click API request failed',
        response.error_code,
      );
    }
  }

  private mapClickInvoiceStatus(
    invoiceStatus: unknown,
    errorCode?: number,
  ): 'pending' | 'cancelled' | 'failed' | 'unknown' {
    if (typeof errorCode === 'number' && errorCode !== 0) {
      return 'failed';
    }

    if (invoiceStatus === 0 || invoiceStatus === '0') {
      return 'pending';
    }

    if (
      invoiceStatus === -1 ||
      invoiceStatus === '-1' ||
      invoiceStatus === -99 ||
      invoiceStatus === '-99'
    ) {
      return 'cancelled';
    }

    return 'unknown';
  }

  async createInvoice(
    data: ClickCreateInvoiceRequest,
  ): Promise<ClickCreateInvoiceResponse> {
    const { orderId, amount, phoneNumber } = data;
    const timestampSec = Math.floor(Date.now() / 1000);

    const payload = {
      service_id: Number(this.config.serviceId),
      amount: toProviderAmount(amount),
      phone_number: phoneNumber,
      merchant_trans_id: orderId,
    };

    const response = await postJson<ClickCreateInvoiceResponse>(
      `${this.config.apiUrl}/invoice/create`,
      payload,
      this.buildMerchantHeaders(timestampSec),
      'Click invoice creation',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async createPayment(
    data: ClickCreateInvoiceRequest,
  ): Promise<ClickPaymentResult> {
    const { orderId, amount } = data;
    const response = await this.createInvoice(data);
    const providerInvoiceId = String(response.invoice_id || orderId);

    return buildPaymentResult({
      provider: 'click',
      transactionId: providerInvoiceId,
      status: 'pending',
      amount,
      orderId,
      providerInvoiceId,
      checkoutReference: providerInvoiceId,
      providerStatus: 'invoice_created',
      message: response.error_note,
      raw: response,
    });
  }

  async checkInvoice(
    data: { invoiceId?: string; transactionId?: string },
  ): Promise<ClickInvoiceStatusResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const invoiceId = data.invoiceId || data.transactionId;
    if (!invoiceId) {
      throw new Error('Click invoice check requires invoiceId or transactionId');
    }
    const response = await getJson<ClickInvoiceStatusResponse>(
      `${this.config.apiUrl}/invoice/status/${this.config.serviceId}/${invoiceId}`,
      this.buildMerchantHeaders(timestampSec),
      'Click invoice check',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async checkPaymentStatus(
    data: { paymentId: string },
  ): Promise<ClickPaymentStatusResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const response = await getJson<ClickPaymentStatusResponse>(
      `${this.config.apiUrl}/payment/status/${this.config.serviceId}/${data.paymentId}`,
      this.buildMerchantHeaders(timestampSec),
      'Click payment check',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async checkPaymentStatusByMerchantTransId(
    data: { orderId: string; paymentDate: string },
  ): Promise<ClickPaymentStatusResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const response = await getJson<ClickPaymentStatusResponse>(
      `${this.config.apiUrl}/payment/status_by_mti/${this.config.serviceId}/${data.orderId}/${data.paymentDate}`,
      this.buildMerchantHeaders(timestampSec),
      'Click payment check by merchant transaction id',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async checkPayment(data: ClickCheckRequest): Promise<ClickPaymentResult> {
    const paymentId = 'paymentId' in data ? data.paymentId : undefined;
    const invoiceId =
      'invoiceId' in data || 'transactionId' in data
        ? ('invoiceId' in data ? data.invoiceId : undefined) ||
          (!paymentId && 'transactionId' in data ? data.transactionId : undefined)
        : undefined;

    if (paymentId) {
      const response = await this.checkPaymentStatus({ paymentId: String(paymentId) });
      const providerPaymentId = String(response.payment_id || paymentId);
      return buildPaymentResult({
        provider: 'click',
        transactionId: providerPaymentId,
        status: this.mapClickMerchantStatus(
          response.payment_status,
          response.error_code,
        ),
        orderId: response.merchant_trans_id || data.orderId,
        providerPaymentId,
        providerStatus:
          response.payment_status !== undefined
            ? String(response.payment_status)
            : undefined,
        message: response.error_note,
        raw: response,
      });
    }

    if (invoiceId) {
      const response = await this.checkInvoice({ invoiceId: String(invoiceId) });
      const providerInvoiceId = String(invoiceId);
      return buildPaymentResult({
        provider: 'click',
        transactionId: providerInvoiceId,
        status: this.mapClickInvoiceStatus(
          response.invoice_status,
          response.error_code,
        ),
        orderId: 'orderId' in data ? data.orderId : undefined,
        providerInvoiceId,
        checkoutReference: providerInvoiceId,
        providerStatus:
          response.invoice_status !== undefined
            ? String(response.invoice_status)
            : undefined,
        message: response.invoice_status_note || response.error_note,
        raw: response,
      });
    }

    if ('orderId' in data && 'paymentDate' in data && data.orderId && data.paymentDate) {
      const response = await this.checkPaymentStatusByMerchantTransId({
        orderId: String(data.orderId),
        paymentDate: String(data.paymentDate),
      });
      const providerPaymentId = String(response.payment_id || data.orderId);
      return buildPaymentResult({
        provider: 'click',
        transactionId: providerPaymentId,
        status: this.mapClickMerchantStatus(
          response.payment_status,
          response.error_code,
        ),
        orderId: data.orderId,
        providerPaymentId,
        providerStatus:
          response.payment_status !== undefined
            ? String(response.payment_status)
            : undefined,
        metadata: {
          paymentDate: data.paymentDate,
        },
        message: response.error_note,
        raw: response,
      });
    }

    throw new Error(
      'Click payment check requires one of: paymentId, invoiceId/transactionId, or orderId+paymentDate',
    );
  }

  async cancelPayment(
    data: ClickCancelPaymentRequest,
  ): Promise<ClickPaymentResult> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const response = await deleteJson<ClickPaymentReversalResponse>(
      `${this.config.apiUrl}/payment/reversal/${this.config.serviceId}/${data.paymentId}`,
      this.buildMerchantHeaders(timestampSec),
      'Click payment reversal',
    );

    this.ensureClickSuccess(response);

    return buildPaymentResult({
      provider: 'click',
      transactionId: String(response.payment_id || data.paymentId),
      status: 'cancelled',
      orderId: data.orderId,
      providerPaymentId: String(response.payment_id || data.paymentId),
      providerStatus: 'reversed',
      message: response.error_note,
      raw: response,
    });
  }

  async submitFiscalItems(
    data: ClickSubmitFiscalItemsRequest,
  ): Promise<ClickCreateInvoiceResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const response = await postJson<ClickCreateInvoiceResponse>(
      `${this.config.apiUrl}/payment/ofd_data/submit_items`,
      {
        service_id: Number(this.config.serviceId),
        payment_id: Number(data.paymentId),
        items: data.items.map((item) => ({
          ...item,
          GoodPrice: toProviderAmount(item.GoodPrice),
          Price: toProviderAmount(item.Price),
          VAT: toProviderAmount(item.VAT),
          ...(item.Discount !== undefined
            ? { Discount: toProviderAmount(item.Discount) }
            : {}),
          ...(item.Other !== undefined
            ? { Other: toProviderAmount(item.Other) }
            : {}),
        })),
        received_ecash: toProviderAmount(data.receivedEcash || 0),
        received_cash: toProviderAmount(data.receivedCash || 0),
        received_card: toProviderAmount(data.receivedCard || 0),
      },
      this.buildMerchantHeaders(timestampSec),
      'Click fiscal data submit items',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async submitFiscalQrCode(
    data: ClickSubmitFiscalQrCodeRequest,
  ): Promise<ClickCreateInvoiceResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    const response = await postJson<ClickCreateInvoiceResponse>(
      `${this.config.apiUrl}/payment/ofd_data/submit_qrcode`,
      {
        service_id: Number(this.config.serviceId),
        payment_id: Number(data.paymentId),
        qrcode: data.qrcode,
      },
      this.buildMerchantHeaders(timestampSec),
      'Click fiscal qrcode submit',
    );

    this.ensureClickSuccess(response);
    return response;
  }

  async getFiscalData(paymentId: string): Promise<ClickFiscalDataResponse> {
    const timestampSec = Math.floor(Date.now() / 1000);
    return getJson<ClickFiscalDataResponse>(
      `${this.config.apiUrl}/payment/ofd_data/${this.config.serviceId}/${paymentId}`,
      this.buildMerchantHeaders(timestampSec),
      'Click fiscal data fetch',
    );
  }

  validateShopApiSignature(
    payload: Record<string, string | number | undefined>,
    signature: string,
  ): boolean {
    const isPrepare = Number(payload.action) === 0;
    const material = isPrepare
      ? `${payload.click_trans_id}${payload.service_id}${this.config.secretKey}${payload.merchant_trans_id}${payload.amount}${payload.action}${payload.sign_time}`
      : `${payload.click_trans_id}${payload.service_id}${this.config.secretKey}${payload.merchant_trans_id}${payload.merchant_prepare_id}${payload.amount}${payload.action}${payload.sign_time}`;

    const expectedSignature = crypto
      .createHash('md5')
      .update(material)
      .digest('hex');

    return signature === expectedSignature;
  }

  generateInvoiceUrl(params: ClickGenerateInvoiceParams): string {
    return generateClickInvoiceUrl({
      merchantId: this.config.merchantId,
      serviceId: this.config.serviceId,
      amount: toProviderAmount(params.amount),
      orderId: params.orderId,
      returnUrl: params.returnUrl,
      cardType: params.cardType,
    });
  }
}
