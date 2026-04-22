# Next.js Integration

SDK лучше использовать только на сервере:

- `app/api/.../route.ts`
- `server actions`
- отдельный server-side service layer внутри приложения

## Recommended Shape

1. Создать один payment service singleton.
2. Вызывать `PaymentsService` из route handlers.
3. Держать merchant secrets только в server env.
4. webhook endpoints принимать отдельно от create/check/cancel routes.
5. для webhook idempotency использовать shared `cacheStore`, а не in-memory default.

Если не хочется руками создавать сервисы, можно использовать:

- `createPaymentsServiceFromEnv()`
- `createWebhookServiceFromEnv()`
- `createPaymentSdkServerServices()`

## Minimal Route Handler

```ts
import { PaymentsService } from 'uz-payment-sdk';

const payments = new PaymentsService({
  providers: {
    click: {
      serviceId: process.env.CLICK_SERVICE_ID!,
      merchantId: process.env.CLICK_MERCHANT_ID!,
      merchantUserId: process.env.CLICK_MERCHANT_USER_ID!,
      secretKey: process.env.CLICK_SECRET_KEY!,
      apiUrl: process.env.CLICK_API_URL!,
    },
  },
});

export async function POST() {
  const invoice = await payments.createClickInvoice({
    orderId: 'order-123',
    amount: 500,
    phoneNumber: '998901234567',
  });

  return Response.json(invoice);
}
```

Готовый пример есть в [/mnt/data/projects/business/uz-pay-sdk/docs/examples/next-route.ts](/mnt/data/projects/business/uz-pay-sdk/docs/examples/next-route.ts).

## Webhook Route

Для raw provider callback можно использовать `processProviderWebhookRequest()`:

```ts
import {
  createWebhookServiceFromEnv,
  processProviderWebhookRequest,
} from 'uz-payment-sdk';

const webhooks = createWebhookServiceFromEnv();

export async function POST(request: Request) {
  const payload = await processProviderWebhookRequest({
    provider: 'payme',
    request,
    webhookService: webhooks,
  });

  return Response.json({ ok: true, payload });
}
```

Для production это нужно создавать с shared store, например Redis-backed `cacheStore`. In-memory режим подходит только для локальной разработки и тестов.

Готовый пример лежит в [/mnt/data/projects/business/uz-pay-sdk/docs/examples/next-webhook-route.ts](/mnt/data/projects/business/uz-pay-sdk/docs/examples/next-webhook-route.ts).
