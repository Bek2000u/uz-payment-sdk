export interface WebhookPayload {
  provider: string;
  transactionId: string;
  orderId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  timestamp: string;
  signature?: string;
}
