import {
  BasePaymentError,
  BasePaymentErrorOptions,
} from './BasePaymentError';

export class PaymentSdkError extends BasePaymentError {
  constructor(message: string, options: BasePaymentErrorOptions = {}) {
    super(message, {
      code: options.code ?? 'sdk_error',
      category: options.category ?? 'internal',
      retryable: options.retryable ?? false,
      ...options,
    });
    this.name = 'PaymentSdkError';
  }
}

export class PaymentValidationError extends PaymentSdkError {
  constructor(message: string, options: BasePaymentErrorOptions = {}) {
    super(message, {
      code: options.code ?? 'validation_error',
      category: 'validation',
      retryable: false,
      ...options,
    });
    this.name = 'PaymentValidationError';
  }
}

export class PaymentConfigurationError extends PaymentSdkError {
  constructor(message: string, options: BasePaymentErrorOptions = {}) {
    super(message, {
      code: options.code ?? 'configuration_error',
      category: 'configuration',
      retryable: false,
      ...options,
    });
    this.name = 'PaymentConfigurationError';
  }
}

export class PaymentTransportError extends PaymentSdkError {
  constructor(message: string, options: BasePaymentErrorOptions = {}) {
    super(message, {
      code: options.code ?? 'transport_error',
      category: options.category ?? 'network',
      retryable: options.retryable ?? true,
      ...options,
    });
    this.name = 'PaymentTransportError';
  }
}
