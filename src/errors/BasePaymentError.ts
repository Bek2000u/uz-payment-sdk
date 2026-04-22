import type { PaymentProviderId } from '../payments/types/payment.types';

export type PaymentErrorCategory =
  | 'validation'
  | 'configuration'
  | 'provider'
  | 'network'
  | 'timeout'
  | 'authentication'
  | 'idempotency'
  | 'internal';

export interface BasePaymentErrorOptions {
  code?: number | string;
  provider?: PaymentProviderId | 'sdk';
  httpStatus?: number;
  retryable?: boolean;
  category?: PaymentErrorCategory;
  details?: unknown;
  cause?: unknown;
}

export class BasePaymentError extends Error {
  code: number | string;
  provider?: PaymentProviderId | 'sdk';
  httpStatus?: number;
  retryable: boolean;
  category: PaymentErrorCategory;
  details?: unknown;
  cause?: unknown;

  constructor(
    message: string,
    codeOrOptions: number | string | BasePaymentErrorOptions = 'payment_error',
  ) {
    super(message);
    this.name = new.target.name;
    const options =
      typeof codeOrOptions === 'object'
        ? codeOrOptions
        : { code: codeOrOptions };
    this.code = options.code ?? 'payment_error';
    this.provider = options.provider;
    this.httpStatus = options.httpStatus;
    this.retryable = options.retryable ?? false;
    this.category = options.category ?? 'internal';
    this.details = options.details;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
