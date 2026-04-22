import type { PaymentProviderId } from '../payments/types/payment.types';

export interface PaymentRetryPolicy {
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  retryableStatusCodes?: number[];
}

export interface PaymentRequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  retry?: number | PaymentRetryPolicy;
}

export interface PaymentTransportRequest extends PaymentRequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  context: string;
  provider?: PaymentProviderId | 'sdk';
}

export interface PaymentTransportResponse<TResponse> {
  data: TResponse;
  status: number;
  headers?: Record<string, string>;
}

export interface PaymentTransport {
  request<TResponse>(
    request: PaymentTransportRequest,
  ): Promise<PaymentTransportResponse<TResponse>>;
}
