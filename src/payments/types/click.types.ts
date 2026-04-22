import type { MinorUnitAmount, PaymentResult } from './payment.types';

export interface ClickApiResponseBase {
  error_code: number;
  error_note?: string;
}

export interface ClickCreateInvoiceRequest {
  orderId: string;
  amount: MinorUnitAmount;
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

export interface ClickPaymentStatusResponse extends ClickApiResponseBase {
  payment_id?: number | string;
  payment_status?: number | string;
  merchant_trans_id?: string;
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
  GoodPrice: number;
  Price: number;
  Amount: number;
  VAT: number;
  VATPercent: number;
  Barcode?: string;
  Labels?: string[];
  Units?: number;
  Discount?: number;
  Other?: number;
  CommissionInfo?: ClickFiscalCommissionInfo;
}

export interface ClickSubmitFiscalItemsRequest {
  paymentId: string;
  items: ClickFiscalItem[];
  receivedEcash?: MinorUnitAmount;
  receivedCash?: MinorUnitAmount;
  receivedCard?: MinorUnitAmount;
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
