# SDK Docs

Короткая навигация по SDK-докам:

- [Getting Started](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/getting-started.md)
- [Next.js Integration](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/nextjs.md)
- [Provider Guides](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/providers.md)
- [Webhook Guide](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/webhooks.md)
- [Testing Matrix](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/testing.md)
- [Releasing](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/releasing.md)

Официальные исходные материалы провайдеров лежат отдельно:

- `/mnt/data/projects/business/uz-pay-sdk/docs/payme`
- `/mnt/data/projects/business/uz-pay-sdk/docs/click`
- `/mnt/data/projects/business/uz-pay-sdk/docs/uzum`

Практический подход такой:

1. Начать с `PaymentsService`, если нужен быстрый server-side integration layer.
2. Переходить на `PaymeClient`, `ClickClient`, `UzumClient`, если нужен raw provider control.
3. Для webhook flows сначала смотреть `WebhookService`, а для Uzum merchant callbacks использовать отдельный merchant toolkit.
