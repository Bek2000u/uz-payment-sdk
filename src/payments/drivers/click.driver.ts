import { PaymentDriver } from '../interfaces/payment-driver.interface';
import { PaymentConfigService } from '../../config/payment-config.service';
import * as crypto from 'crypto';
import { buildPaymentResult } from '../utils/normalizers.util';
import { deleteJson, getJson, postJson } from '../utils/http-client.util';
import {
  ClickGenerateInvoiceParams,
  PaymentResult,
} from '../types/payment.types';
import { generateClickMerchantAuthHeader } from '../utils/signer.util';
import { ClickError } from '../../errors/ClickError';
import { generateClickInvoiceUrl } from '../utils/invoice.util';
import {
  ClickCancelPaymentRequest,
  ClickCreateInvoiceRequest,
  ClickCreateInvoiceResponse,
  ClickFiscalDataResponse,
  ClickInvoiceStatusResponse,
  ClickPaymentStatusResponse,
  ClickPaymentReversalResponse,
  ClickSubmitFiscalItemsRequest,
  ClickSubmitFiscalQrCodeRequest,
} from '../types/click.types';

export class ClickDriver implements PaymentDriver {
  private config: any;

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

  private ensureClickSuccess(response: any): void {
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
      amount,
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
  ): Promise<PaymentResult> {
    const { orderId, amount } = data;
    const response = await this.createInvoice(data);
    return buildPaymentResult({
      provider: 'click',
      transactionId: String(response.invoice_id || orderId),
      status: 'pending',
      amount,
      orderId,
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

  async checkPayment(data: any): Promise<PaymentResult> {
    const paymentId = data.paymentId;
    const invoiceId = data.invoiceId || (!paymentId ? data.transactionId : undefined);

    if (paymentId) {
      const response = await this.checkPaymentStatus({ paymentId: String(paymentId) });
      return buildPaymentResult({
        provider: 'click',
        transactionId: String(response.payment_id || paymentId),
        status: this.mapClickMerchantStatus(
          response.payment_status,
          response.error_code,
        ),
        orderId: data.orderId,
        message: response.error_note,
        raw: response,
      });
    }

    if (invoiceId) {
      const response = await this.checkInvoice({ invoiceId: String(invoiceId) });
      return buildPaymentResult({
        provider: 'click',
        transactionId: String(invoiceId),
        status: this.mapClickInvoiceStatus(
          response.invoice_status,
          response.error_code,
        ),
        orderId: data.orderId,
        message: response.invoice_status_note || response.error_note,
        raw: response,
      });
    }

    if (data.orderId && data.paymentDate) {
      const response = await this.checkPaymentStatusByMerchantTransId({
        orderId: String(data.orderId),
        paymentDate: String(data.paymentDate),
      });
      return buildPaymentResult({
        provider: 'click',
        transactionId: String(response.payment_id || data.orderId),
        status: this.mapClickMerchantStatus(
          response.payment_status,
          response.error_code,
        ),
        orderId: data.orderId,
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
  ): Promise<PaymentResult> {
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
        items: data.items,
        received_ecash: data.receivedEcash || 0,
        received_cash: data.receivedCash || 0,
        received_card: data.receivedCard || 0,
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

  validateShopApiSignature(payload: any, signature: string): boolean {
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
      amount: params.amount,
      orderId: params.orderId,
      returnUrl: params.returnUrl,
      cardType: params.cardType,
    });
  }
}
