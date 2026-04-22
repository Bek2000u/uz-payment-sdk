import { BasePaymentError } from './BasePaymentError';

interface PaymeJsonRpcMessage {
  en?: string;
  ru?: string;
  uz?: string;
}

interface PaymeJsonRpcErrorLike {
  code: number;
  message?: PaymeJsonRpcMessage | string;
  data?: unknown;
}

export class PaymeError extends BasePaymentError {
  data?: unknown;

  constructor(message: string, code: number | string, data?: unknown) {
    super(message, code);
    this.name = 'PaymeError';
    this.data = data;
  }

  static fromJsonRpcError(error: PaymeJsonRpcErrorLike): PaymeError {
    const message =
      typeof error.message === 'string'
        ? error.message
        : error.message?.en ||
          error.message?.ru ||
          error.message?.uz ||
          'Unknown Payme error';

    return new PaymeError(message, error.code, error.data);
  }
}
