# Payment SDK

TypeScript SDK для интеграции с `payme`, `click` и `uzum`.

Репозиторий очищен до SDK-only формата: без отдельного app-слоя, без Nest bootstrap как обязательной части, без legacy-провайдеров и без бренд-зависимого core-конфига.

## Install

```bash
npm install uz-payment-sdk
```

## Money Contract

Во всём SDK поле `amount` всегда передаётся в минимальных единицах валюты.

- `UZS` -> тийины
- `50000` = `500.00 UZS`

Это правило едино для:

- `Payme receipts.*`
- `Click invoice/payment/fiscalization`
- `Uzum Checkout`
- webhook payloads и normalized responses

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
  amount: 50000,
  phoneNumber: '998901234567'
});

const invoiceUrl = payments.generateInvoiceUrl({
  provider: 'click',
  orderId: 'order-123',
  amount: 50000,
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

## Support Matrix

| Provider | Covered now | Notes |
| --- | --- | --- |
| Payme | `receipts.create`, `receipts.check`, `receipts.cancel`, `receipts.get`, `receipts.send`, `receipts.pay`, `receipts.set_fiscal_data`, hosted invoice URL, optional card token flow (`cards.create`, `cards.get_verify_code`, `cards.verify`, `cards.check`) | `amount` всегда в тийинах |
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
  amount: 250000,
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
  amount: 150000,
  returnUrl: 'https://merchant.example/return',
});

await payments.refundUzumPayment({
  orderId: registered.transactionId,
  amount: 150000,
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

## Webhook Forwarding Env

- `ENTERPRISE_WEBHOOK_URL`
- `ENTERPRISE_WEBHOOK_SECRET`
- `ENTERPRISE_WEBHOOK_TIMEOUT_MS`
- `ENTERPRISE_WEBHOOK_SOURCE`
- `ENTERPRISE_WEBHOOK_HEADER_PREFIX`

## Repo Layout

- `src` — core SDK
- `docs/examples` — минимальные примеры интеграции

## Scripts

- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run release:smoke`
