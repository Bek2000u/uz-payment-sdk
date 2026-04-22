# Webhooks

## Generic Normalized Flow

`WebhookService` работает с нормализованным `WebhookPayload` и умеет:

- резервировать idempotency key
- собирать enterprise forwarding envelope
- парсить raw `Click` webhook
- парсить raw `Payme` webhook

## Provider Parsing

Используй:

- `parseClickWebhook(...)`
- `parsePaymeWebhook(...)`

Эти методы возвращают канонический `WebhookPayload`, который уже можно безопасно подавать дальше в Sim или внутренний event bus.

## Uzum Merchant API

Для `Uzum` merchant callbacks в SDK есть отдельный toolkit:

- `validateUzumMerchantAuthorization`
- `createUzumMerchantCheckResponse`
- `createUzumMerchantCreateResponse`
- `createUzumMerchantConfirmResponse`
- `createUzumMerchantReverseResponse`
- `createUzumMerchantStatusResponse`

Важно: этот слой повторяет официальный merchant contract Uzum, а не friendly facade SDK.
