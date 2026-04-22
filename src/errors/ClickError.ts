import { BasePaymentError } from './BasePaymentError';

export class ClickError extends BasePaymentError {
  constructor(message: string, code: number | string) {
    super(message, code);
    this.name = 'ClickError';
  }
}
