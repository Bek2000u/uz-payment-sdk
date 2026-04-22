import { BasePaymentError } from './BasePaymentError';

export class ClickError extends BasePaymentError {
  constructor(
    message: string,
    code: number | string,
    options: Record<string, unknown> = {},
  ) {
    super(message, {
      code,
      provider: 'click',
      category: 'provider',
      retryable: false,
      details: options,
    });
    this.name = 'ClickError';
  }
}
