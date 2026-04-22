import {
  NormalizedPaymentStatus,
  PaymentProviderId,
  PaymentResult,
} from '../types/payment.types';

export const normalizePaymentStatus = (
  status: unknown,
): NormalizedPaymentStatus => {
  if (typeof status === 'number') {
    switch (status) {
      case 1:
      case 2:
      case 3:
      case 5:
      case 6:
      case 20:
      case 30:
        return 'processing';
      case 4:
        return 'success';
      case 0:
        return 'pending';
      case -1:
      case -2:
      case 21:
      case 50:
        return 'cancelled';
      default:
        return 'unknown';
    }
  }

  if (typeof status !== 'string') {
    return 'unknown';
  }

  const normalized = status.toLowerCase();

  if (
    ['success', 'successful', 'completed', 'paid', 'done', 'confirmed'].includes(
      normalized,
    )
  ) {
    return 'success';
  }

  if (
    ['pending', 'created', 'new', 'waiting', 'registered', 'register'].includes(
      normalized,
    )
  ) {
    return 'pending';
  }

  if (
    ['processing', 'in_progress', 'authorized', 'authorizing'].includes(
      normalized,
    )
  ) {
    return 'processing';
  }

  if (['cancelled', 'canceled', 'cancel', 'reversed', 'reverse'].includes(normalized)) {
    return 'cancelled';
  }

  if (['refunded', 'refund'].includes(normalized)) {
    return 'refunded';
  }

  if (
    ['failed', 'failure', 'error', 'denied', 'declined', 'fail'].includes(
      normalized,
    )
  ) {
    return 'failed';
  }

  return 'unknown';
};

export const firstDefined = <T>(...values: Array<T | undefined | null>): T | undefined => {
  return values.find(value => value !== undefined && value !== null);
};

export const buildPaymentResult = ({
  provider,
  transactionId,
  status,
  paymentUrl,
  amount,
  currency,
  orderId,
  message,
  raw,
}: {
  provider: PaymentProviderId;
  transactionId: string;
  status: unknown;
  paymentUrl?: string;
  amount?: number;
  currency?: string;
  orderId?: string;
  message?: string;
  raw?: any;
}): PaymentResult => {
  return {
    success: true,
    provider,
    transactionId,
    status: normalizePaymentStatus(status),
    paymentUrl,
    amount,
    currency,
    orderId,
    message,
    raw,
  };
};
