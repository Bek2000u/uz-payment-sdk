import type { PaymentAmount, PaymentResult, ProviderAmount } from './payment.types';

export interface UzumApiResponse<TResult> {
  errorCode: number;
  message?: string;
  result?: TResult;
}

export interface UzumOperation {
  operationId?: string;
  merchantOperationId?: string;
  operationType?: string;
  state?: string;
  rrn?: string;
  actionCodeDescription?: string;
}

export interface UzumRegisterPaymentRequest {
  orderId: string;
  amount: PaymentAmount;
  returnUrl?: string;
  successUrl?: string;
  failureUrl?: string;
  clientId?: string;
  currencyCode?: number;
  currency?: number;
  paymentDetails?: string;
  description?: string;
  viewType?: 'REDIRECT' | 'WEB_VIEW' | 'IFRAME';
  sessionTimeoutSecs?: number;
  operationType?: 'PAYMENT' | 'BINDING';
  payType?: 'ONE_STEP' | 'TWO_STEP';
  phoneNumber?: string;
  force3ds?: boolean;
  merchantParams?: Record<string, unknown>;
}

export interface UzumRegisterPaymentResult {
  orderId: string;
  paymentRedirectUrl?: string;
}

export interface UzumGetOrderStatusRequest {
  orderId?: string;
  transactionId?: string;
}

export interface UzumGetOperationStateRequest {
  operationId: string;
  amount?: PaymentAmount;
  orderId?: string;
}

export interface UzumOrderStatusResult {
  orderId: string;
  status: string;
  merchantOrderId: string;
  amount: ProviderAmount;
  totalAmount: ProviderAmount;
  completedAmount: ProviderAmount;
  refundedAmount: ProviderAmount;
  reversedAmount: ProviderAmount;
  operations: UzumOperation[];
  bindingId?: string;
  actionCode?: number;
  cardType?: 1 | 2;
}

export interface UzumOperationStateResult {
  operation: UzumOperation;
}

export interface UzumOperationCommand {
  orderId: string;
  amount: PaymentAmount;
  operationId?: string;
}

export interface UzumOperationResult {
  operationId: string;
}

export interface UzumMerchantPayBindProcessData {
  type: 'bind';
  bindingId: string;
}

export interface UzumMerchantPayCardProcessData {
  type: 'card';
  cardToken: string;
  cryptogram?: string;
}

export interface UzumMerchantPayTechCardProcessData {
  type: 'tech_card';
  cardId: string;
}

export type UzumMerchantPayProcessData =
  | UzumMerchantPayBindProcessData
  | UzumMerchantPayCardProcessData
  | UzumMerchantPayTechCardProcessData;

export interface UzumMerchantPayRequest {
  orderId: string;
  returnUrl: string;
  processData: UzumMerchantPayProcessData;
  operationId?: string;
}

export interface UzumMerchantPayResult {
  operationId: string;
  mdOrder: string;
  dataFor3ds?: {
    acsUrl?: string;
    paReq?: string;
    termUrl?: string;
  };
}

export interface UzumGetReceiptsRequest {
  orderId: string;
}

export interface UzumReceiptItem {
  receiptId?: number | string;
  status?: string;
  qrCodeUrl?: string;
  type?: string;
  totalAmount?: ProviderAmount;
}

export interface UzumGetReceiptsResult {
  receipts: UzumReceiptItem[];
}

export interface UzumPurchaseReceiptRequest {
  orderId: string;
  cart: Record<string, unknown>;
  operationId?: string;
}

export interface UzumPurchaseReceiptResult {
  receiptId?: number | string;
  status?: string;
  qrCodeUrl?: string;
}

export type UzumPaymentResult<TRaw = unknown> = PaymentResult<TRaw, 'uzum'>;
