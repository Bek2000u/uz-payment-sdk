# Payment SDK

TypeScript SDK для интеграции с `payme`, `click` и `uzum`.

Быстрая документация для интегратора лежит в:

- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/README.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/README.md)
- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/getting-started.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/getting-started.md)
- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/nextjs.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/nextjs.md)
- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/providers.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/providers.md)
- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/webhooks.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/webhooks.md)
- [/mnt/data/projects/business/uz-pay-sdk/docs/sdk/testing.md](/mnt/data/projects/business/uz-pay-sdk/docs/sdk/testing.md)

## Install

```bash
npm install uz-payment-sdk
```

## Money Contract

Во всём SDK поле `amount` передаётся просто в `UZS`.

- `500` = `500 UZS`
- `1250.5` = `1250.5 UZS`

Это правило едино для:

- `Payme receipts.*`
- `Click invoice/payment/fiscalization`
- `Uzum Checkout`
- webhook payloads и normalized responses

Внутри драйверов SDK сам конвертирует сумму в provider-specific формат там, где провайдер ожидает минимальные единицы валюты.

## Stable Contract

Для интеграции можно считать стабильными такие правила:

- `PaymentResult.amount` всегда возвращается в `UZS`
- `PaymentResult.success` вычисляется из нормализованного `status`, а не из raw provider payload
- `transactionId` — основной SDK id для дальнейших операций
- `providerInvoiceId` и `providerPaymentId` сохраняют official ids провайдера, когда они реально есть
- `checkoutReference` даёт стабильную ссылку на checkout/order flow без парсинга `raw`

Эти правила зафиксированы и экспортируются из SDK как:

- `SDK_RESULT_CONTRACT`
- `SDK_SUPPORT_POLICY`

## Quick Start

```ts
import { PaymentsService } from 'uz-payment-sdk';

const payments = new PaymentsService({
  providers: {
    click: {
      serviceId: '101202',
      merchantId: 'merchant-1',
      merchantUserId: 'merchant-user-1',
      secretKey: 'secret',
      apiUrl: 'https://api.click.uz/v2/merchant'
    }
  }
});

const invoice = await payments.createClickInvoice({
  orderId: 'order-123',
  amount: 500,
  phoneNumber: '998901234567'
});

const invoiceUrl = payments.generateInvoiceUrl({
  provider: 'click',
  orderId: 'order-123',
  amount: 500,
  returnUrl: 'https://your-app.uz/payments/return'
});
```

`PaymentsService` поддерживает оба стиля:

- `create({ provider, ...data })`
- `create(provider, data)`

И поверх этого даёт явные facade methods:

- `createClickInvoice`
- `checkClickInvoice`
- `checkClickPayment`
- `checkClickPaymentByOrder`
- `cancelClickPayment`
- `createPaymeReceipt`
- `checkPaymeReceipt`
- `cancelPaymeReceipt`
- `getPaymeReceipt`
- `sendPaymeReceipt`
- `payPaymeReceipt`
- `setPaymeReceiptFiscalData`
- `registerUzumPayment`
- `completeUzumPayment`
- `reverseUzumPayment`
- `refundUzumPayment`
- `merchantPayUzum`
- `getUzumReceipts`
- `purchaseUzumReceipt`

Если нужен более низкий уровень, можно работать напрямую с provider clients:

- `PaymeClient`
- `ClickClient`
- `UzumClient`

## Support Matrix

| Provider | Covered now | Notes |
| --- | --- | --- |
| Payme | `receipts.create`, `receipts.check`, `receipts.cancel`, `receipts.get`, `receipts.send`, `receipts.pay`, `receipts.set_fiscal_data`, hosted invoice URL, optional card token flow (`cards.create`, `cards.get_verify_code`, `cards.verify`, `cards.check`) | public SDK amount всегда в `UZS` |
| Click | `invoice.create`, `invoice.status`, `payment.status`, `payment.status_by_mti`, `payment.reversal`, hosted invoice URL, fiscalization submit/get endpoints | invoice flow и payment flow разделены по official docs |
| Uzum Checkout | `payment.register`, `payment.getOrderStatus`, `payment.getOperationState`, `payment.merchantPay`, `payment.getReceipts`, `acquiring.complete`, `acquiring.refund`, `acquiring.reverse`, `acquiring.purchaseReceipt` | merchant callbacks вынесены в отдельный toolkit |
| Uzum Merchant API | typed request/response helpers для `/check`, `/create`, `/confirm`, `/reverse`, `/status`, basic auth validation helper | нужно реализовать свой HTTP handler в приложении |

## Provider Examples

### Payme

```ts
const payments = new PaymentsService({
  providers: {
    payme: {
      merchantId: process.env.PAYME_MERCHANT_ID!,
      key: process.env.PAYME_KEY!,
      apiUrl: process.env.PAYME_API_URL!,
    }
  }
});

const receipt = await payments.createPaymeReceipt({
  orderId: 'order-1',
  amount: 2500,
});

await payments.sendPaymeReceipt({
  transactionId: receipt.transactionId,
  phone: '998901234567',
});
```

### Click

```ts
const status = await payments.checkClickPayment({
  paymentId: '1946296773',
});

await payments.cancelClickPayment({
  paymentId: '1946296773',
});
```

### Uzum

```ts
const registered = await payments.registerUzumPayment({
  orderId: '504e8fa5-2eab-456a-acc3-822147fd0c533',
  amount: 1500,
  returnUrl: 'https://merchant.example/return',
});

await payments.refundUzumPayment({
  orderId: registered.transactionId,
  amount: 1500,
});
```

## Uzum Merchant Webhook Toolkit

```ts
import {
  createUzumMerchantCheckResponse,
  createUzumMerchantConfirmErrorResponse,
  validateUzumMerchantAuthorization,
} from 'uz-payment-sdk';
```

Доступно:

- `validateUzumMerchantAuthorization`
- `createUzumMerchantAuthorizationHeader`
- `createUzumMerchantCheckResponse`
- `createUzumMerchantCheckErrorResponse`
- `createUzumMerchantCreateResponse`
- `createUzumMerchantCreateErrorResponse`
- `createUzumMerchantConfirmResponse`
- `createUzumMerchantConfirmErrorResponse`
- `createUzumMerchantReverseResponse`
- `createUzumMerchantReverseErrorResponse`
- `createUzumMerchantStatusResponse`
- `createUzumMerchantStatusErrorResponse`

Важно:
helper-ы для `Uzum Merchant API` повторяют официальный webhook contract провайдера. Если Uzum требует raw amount в минимальных единицах, в этих webhook responses нужно следовать именно official schema.

## Webhook Forwarding Env

- `ENTERPRISE_WEBHOOK_URL`
- `ENTERPRISE_WEBHOOK_SECRET`
- `ENTERPRISE_WEBHOOK_TIMEOUT_MS`
- `ENTERPRISE_WEBHOOK_SOURCE`
- `ENTERPRISE_WEBHOOK_HEADER_PREFIX`

## Repo Layout

- `src/core` — стабильные SDK contracts и общие правила
- `src/providers/payme` — low-level Payme client
- `src/providers/click` — low-level Click client
- `src/providers/uzum` — low-level Uzum client
- `src/payments` — high-level facade и нормализация результатов
- `src/webhooks` — webhook parsing, normalization и Uzum merchant toolkit
- `docs/examples` — минимальные примеры интеграции

## Scripts

- `npm run typecheck`
- `npm run test:contracts`
- `npm test`
- `npm run test:bun`
- `npm run test:matrix`
- `npm run build`
- `npm run release:smoke`
