import { PaymentSdkConfig } from '../config/payment-config.service';
import { PaymentsService } from '../payments/payments.service';
import { WebhookService } from '../webhooks/webhook.service';

export interface PaymentSdkServerServices {
  payments: PaymentsService;
  webhooks: WebhookService;
}

export const assertServerOnly = (): void => {
  if (typeof window !== 'undefined') {
    throw new Error(
      'uz-payment-sdk server helpers can only be used on the server',
    );
  }
};

export const createPaymentsServiceFromEnv = (
  config: PaymentSdkConfig = {},
): PaymentsService => {
  assertServerOnly();
  return new PaymentsService(config);
};

export const createWebhookServiceFromEnv = (
  config: PaymentSdkConfig = {},
): WebhookService => {
  assertServerOnly();
  return new WebhookService(config);
};

export const createPaymentSdkServerServices = (
  config: PaymentSdkConfig = {},
): PaymentSdkServerServices => {
  assertServerOnly();

  return {
    payments: new PaymentsService(config),
    webhooks: new WebhookService(config),
  };
};
