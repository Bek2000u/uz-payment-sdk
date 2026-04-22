import type { PaymentAmount, ProviderAmount } from '../types/payment.types';

const UZS_MINOR_UNIT_FACTOR = 100;

export const toProviderAmount = (amount: PaymentAmount): ProviderAmount => {
  return Math.round(amount * UZS_MINOR_UNIT_FACTOR);
};

export const fromProviderAmount = (
  amount?: ProviderAmount | null,
): PaymentAmount | undefined => {
  if (amount === undefined || amount === null) {
    return undefined;
  }

  return amount / UZS_MINOR_UNIT_FACTOR;
};
