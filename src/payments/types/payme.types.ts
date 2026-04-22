import type { PaymentAmount, PaymentResult, ProviderAmount } from './payment.types';

export interface PaymeAccountRef {
  order_id: string;
}

export interface PaymeReceipt {
  _id?: string;
  id?: string;
  state?: number;
  amount?: ProviderAmount;
  create_time?: number;
  pay_time?: number;
  cancel_time?: number;
  currency?: number;
  description?: string;
  detail?: Record<string, unknown> | null;
  meta?: Record<string, unknown> | null;
  account?: PaymeAccountRef | Array<{ name: string; value: string }>;
  payer?: {
    phone?: string;
    email?: string;
    name?: string;
    id?: string;
    ip?: string;
  };
  card?: {
    number?: string;
    expire?: string;
  } | null;
}

export interface PaymeJsonRpcErrorPayload {
  code: number;
  message?: string | Record<string, string>;
  data?: unknown;
}

export interface PaymeJsonRpcSuccess<TResult> {
  jsonrpc?: '2.0';
  id?: number | string | null;
  result: TResult;
}

export interface PaymeJsonRpcErrorResponse {
  jsonrpc?: '2.0';
  id?: number | string | null;
  error: PaymeJsonRpcErrorPayload;
}

export interface PaymeMerchantApiRequest {
  jsonrpc?: '2.0';
  id?: number | string | null;
  method:
    | 'CheckPerformTransaction'
    | 'CreateTransaction'
    | 'PerformTransaction'
    | 'CancelTransaction'
    | 'CheckTransaction';
  params: {
    id?: string;
    time?: number;
    amount?: ProviderAmount;
    account?: Record<string, unknown>;
    reason?: number;
  };
}

export type PaymeJsonRpcResponse<TResult> =
  | PaymeJsonRpcSuccess<TResult>
  | PaymeJsonRpcErrorResponse;

export interface PaymeReceiptEnvelope {
  receipt: PaymeReceipt;
}

export interface PaymeSendReceiptResult {
  success: boolean;
}

export interface PaymeSetFiscalData {
  status_code: number;
  message: string;
  terminal_id: string;
  receipt_id: number;
  date: string;
  fiscal_sign: string;
  qr_code_url: string;
}

export interface PaymeReceiptPayer {
  id?: string;
  phone?: string;
  email?: string;
  name?: string;
  ip?: string;
}

export interface PaymeCreateReceiptRequest {
  orderId: string;
  amount: PaymentAmount;
  detail?: Record<string, unknown>;
  description?: string;
}

export interface PaymeReceiptLookupRequest {
  transactionId: string;
}

export interface PaymeSendReceiptRequest {
  transactionId: string;
  phone: string;
}

export interface PaymePayReceiptRequest {
  transactionId: string;
  token: string;
  payer?: PaymeReceiptPayer;
  hold?: boolean;
}

export interface PaymeSetReceiptFiscalDataRequest {
  transactionId: string;
  fiscalData: PaymeSetFiscalData;
}

export interface PaymeCreateCardRequest {
  number: string;
  expire: string;
  save?: boolean;
}

export interface PaymeCardTokenResult {
  token: string;
  card?: {
    number?: string;
    expire?: string;
  };
  verify?: boolean;
}

export interface PaymeGetCardVerifyCodeRequest {
  token: string;
}

export interface PaymeVerifyCardRequest {
  token: string;
  code: string;
}

export interface PaymeCheckCardRequest {
  token: string;
}

export type PaymePaymentResult<TRaw = unknown> = PaymentResult<TRaw, 'payme'>;
