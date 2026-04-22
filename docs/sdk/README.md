# SDK Docs

Короткая навигация по SDK-докам:

- [Getting Started](getting-started.md)
- [Next.js Integration](nextjs.md)
- [Provider Guides](providers.md)
- [Webhook Guide](webhooks.md)
- [Testing Matrix](testing.md)
- [Releasing](releasing.md)

Официальные исходные материалы провайдеров лежат отдельно:

- [Payme Docs](../payme)
- [Click Docs](../click)
- [Uzum Docs](../uzum)

Практический подход такой:

1. Начать с `PaymentsService`, если нужен быстрый server-side integration layer.
2. Переходить на `PaymeClient`, `ClickClient`, `UzumClient`, если нужен raw provider control.
3. Для webhook flows сначала смотреть `WebhookService`, а для Uzum merchant callbacks использовать отдельный merchant toolkit.
