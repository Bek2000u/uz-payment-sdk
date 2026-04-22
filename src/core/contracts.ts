export const SDK_RESULT_CONTRACT = {
  amountUnit: 'UZS',
  successRule:
    'success is false only for failed, cancelled, or unknown normalized statuses',
  transactionId:
    'primary normalized identifier returned by the current provider flow',
  providerInvoiceId:
    'stable provider invoice or order registration identifier when available',
  providerPaymentId:
    'stable provider payment or operation identifier when available',
  checkoutReference:
    'stable redirect or checkout reference exposed for UI or reconciliation use',
} as const;

export const SDK_SUPPORT_POLICY = {
  stable: [
    'PaymentsService high-level facade methods',
    'PaymentResult normalized fields',
    'WebhookPayload normalized shape',
    'PaymeClient, ClickClient, UzumClient low-level clients',
    'UZS public amount contract',
  ],
  providerSpecific: [
    'Payme card tokenization and receipt lifecycle methods',
    'Click fiscalization and invoice or payment status split',
    'Uzum merchant toolkit and acquiring commands',
  ],
} as const;

export type SdkResultContract = typeof SDK_RESULT_CONTRACT;
export type SdkSupportPolicy = typeof SDK_SUPPORT_POLICY;
export type SdkSupportSurface = keyof SdkSupportPolicy;
