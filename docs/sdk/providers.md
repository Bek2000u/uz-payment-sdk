# Provider Guides

## High-Level Recommendation

- `Payme`: хорошо подходит для receipt lifecycle и hosted invoice URL
- `Click`: хорошо подходит для invoice flow, payment status и fiscalization
- `Uzum`: лучше использовать там, где нужен Checkout + reverse/refund + merchant callbacks

## Payme

SDK покрывает:

- `receipts.create`
- `receipts.check`
- `receipts.cancel`
- `receipts.get`
- `receipts.send`
- `receipts.pay`
- `receipts.set_fiscal_data`
- hosted invoice URL
- optional card token flow

Reference:
- [Payme Docs](../payme)

## Click

SDK покрывает:

- `invoice.create`
- `invoice.status`
- `payment.status`
- `payment.status_by_mti`
- `payment.reversal`
- hosted invoice URL
- fiscalization endpoints

Reference:
- [Click Docs](../click)

## Uzum

SDK покрывает:

- `payment.register`
- `payment.getOrderStatus`
- `payment.getOperationState`
- `payment.merchantPay`
- `payment.getReceipts`
- `acquiring.complete`
- `acquiring.refund`
- `acquiring.reverse`
- `acquiring.purchaseReceipt`

Reference:
- [Uzum Docs](../uzum)
