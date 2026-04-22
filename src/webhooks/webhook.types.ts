import type { PaymentMetadata } from '../payments/types/payment.types';
import type { ClickWebhookPayload } from '../payments/types/click.types';
import type { PaymeMerchantApiRequest } from '../payments/types/payme.types';

export interface WebhookPayload {
  provider: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  timestamp: string;
  providerInvoiceId?: string;
  providerPaymentId?: string;
  providerStatus?: string;
  metadata?: PaymentMetadata;
  signature?: string;
}

export type SupportedRawWebhookPayload =
  | ClickWebhookPayload
  | PaymeMerchantApiRequest;
