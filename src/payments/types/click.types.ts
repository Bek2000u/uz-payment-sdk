import type { PaymentAmount, PaymentResult } from './payment.types';

export interface ClickApiResponseBase {
  error_code: number;
  error_note?: string;
}

export interface ClickCreateInvoiceRequest {
  orderId: string;
  amount: PaymentAmount;
  phoneNumber: string;
}

export interface ClickCreateInvoiceResponse extends ClickApiResponseBase {
  invoice_id?: number | string;
}

export interface ClickCheckInvoiceRequest {
  invoiceId?: string;
  transactionId?: string;
  orderId?: string;
}

export interface ClickInvoiceStatusResponse extends ClickApiResponseBase {
  invoice_status?: number | string;
  invoice_status_note?: string;
}

export interface ClickCheckPaymentRequest {
  paymentId: string;
  orderId?: string;
}

export interface ClickCheckPaymentByMerchantTransIdRequest {
  orderId: string;
  paymentDate: string;
}

export type ClickCheckRequest =
  | ClickCheckInvoiceRequest
  | ClickCheckPaymentRequest
  | ClickCheckPaymentByMerchantTransIdRequest;

export interface ClickPaymentStatusResponse extends ClickApiResponseBase {
  payment_id?: number | string;
  payment_status?: number | string;
  merchant_trans_id?: string;
}

export interface ClickWebhookPayload {
  click_trans_id: string | number;
  service_id: string | number;
  merchant_trans_id: string;
  amount: string | number;
  action: string | number;
  sign_time: string;
  sign_string?: string;
  error?: string | number;
  error_note?: string;
  merchant_prepare_id?: string | number;
}

export interface ClickCancelPaymentRequest {
  paymentId: string;
  orderId?: string;
}

export interface ClickPaymentReversalResponse extends ClickApiResponseBase {
  payment_id?: number | string;
}

export interface ClickFiscalCommissionInfo {
  TIN?: string;
  PINFL?: string;
}

export interface ClickFiscalItem {
  Name: string;
  SPIC: string;
  PackageCode: string;
  GoodPrice: PaymentAmount;
  Price: PaymentAmount;
  Amount: number;
  VAT: PaymentAmount;
  VATPercent: number;
  Barcode?: string;
  Labels?: string[];
  Units?: number;
  Discount?: PaymentAmount;
  Other?: PaymentAmount;
  CommissionInfo?: ClickFiscalCommissionInfo;
}

export interface ClickSubmitFiscalItemsRequest {
  paymentId: string;
  items: ClickFiscalItem[];
  receivedEcash?: PaymentAmount;
  receivedCash?: PaymentAmount;
  receivedCard?: PaymentAmount;
}

export interface ClickSubmitFiscalQrCodeRequest {
  paymentId: string;
  qrcode: string;
}

export interface ClickFiscalDataResponse {
  paymentId: number | string;
  qrCodeURL: string;
}

export type ClickPaymentResult<TRaw = unknown> = PaymentResult<TRaw, 'click'>;
