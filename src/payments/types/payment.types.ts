export const PAYMENT_PROVIDERS = [
  'payme',
  'click',
  'uzum',
] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

/**
 * Public SDK amount contract: amount is expressed in UZS.
 * Example: 500 means 500 UZS.
 */
export type PaymentAmount = number;

/**
 * Raw provider amount contract: amount is expressed in the smallest currency unit.
 * For UZS this means tiyin.
 */
export type ProviderAmount = number;

/**
 * @deprecated Use PaymentAmount for SDK-facing values or ProviderAmount for raw provider values.
 */
export type MinorUnitAmount = PaymentAmount;

export type NormalizedPaymentStatus =
  | 'pending'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'processing'
  | 'unknown';

export interface PaymentResult<
  TRaw = unknown,
  TProvider extends PaymentProviderId = PaymentProviderId,
> {
  success: boolean;
  provider: TProvider;
  transactionId: string;
  status: NormalizedPaymentStatus;
  paymentUrl?: string;
  amount?: PaymentAmount;
  currency?: string;
  orderId?: string;
  message?: string;
  raw?: TRaw;
}

export interface ProviderInfo {
  name: string;
  description: string;
  supportedMethods: Array<'create' | 'check' | 'cancel'>;
  currency: string[];
  requiredFields?: string[];
  optionalFields?: string[];
}

export interface GenerateInvoiceParams {
  amount: PaymentAmount;
  orderId: string;
  returnUrl: string;
}

export interface ClickGenerateInvoiceParams extends GenerateInvoiceParams {
  cardType?: string;
}
