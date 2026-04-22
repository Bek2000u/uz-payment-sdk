# Getting Started

## Install

```bash
npm install uz-payment-sdk
```

## Choose The Right API

- `PaymentsService`:
  лучший вариант для обычной интеграции в приложение.
- `PaymeClient`, `ClickClient`, `UzumClient`:
  нужны, если хочется работать ближе к official provider API.

## Money Contract

Во внешнем API SDK `amount` всегда передаётся в `UZS`.

- `500` значит `500 UZS`
- конвертация в minor units делается внутри provider clients

## Stable Result Fields

Стабильные поля нормализованного результата:

- `transactionId`
- `status`
- `success`
- `amount`
- `providerInvoiceId`
- `providerPaymentId`
- `checkoutReference`
- `providerStatus`
- `metadata`

Эти правила формально экспортируются из SDK как `SDK_RESULT_CONTRACT` и `SDK_SUPPORT_POLICY`.
