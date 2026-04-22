export const PAYMENT_PROVIDERS = [
  'payme',
  'click',
  'uzum',
] as const;

export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

/**
 * All provider amounts in this SDK are expressed in the smallest currency unit.
 * For UZS this means tiyin.
 */
export type MinorUnitAmount = number;

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
  amount?: MinorUnitAmount;
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
  amount: MinorUnitAmount;
  orderId: string;
  returnUrl: string;
}

export interface ClickGenerateInvoiceParams extends GenerateInvoiceParams {
  cardType?: string;
}
