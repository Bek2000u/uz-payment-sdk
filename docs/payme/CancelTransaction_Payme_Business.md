# CancelTransaction | Payme Business

Метод **CancelTransaction** отменяет как созданную, так и проведенную транзакцию.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/merchant_api/CancelTransaction.png#pw)

**Параметры запроса**

| Имя | Тип | Описание |
| --- | --- | --- |
| id | ID | Идентификатор транзакции Payme Business. |
| reason | Reason | Причина отмены транзакции. |

**Пример запроса**

```
{    "method" : "CancelTransaction",    "params" : {        "id" : "5305e3bab097f420a62ced0b",        "reason" : 1    }}
```

**Параметры ответа**

| Имя | Тип | Описание |
| --- | --- | --- |
| transaction | String | Номер или идентификатор транзакции в биллинге мерчанта. Формат строки определяется мерчантом. |
| cancel\_time | Timestamp | Время отмены транзакции. |
| state | State | Состояние транзакции |

**Пример ответа**

```
{    "result" : {        "transaction" : "5123",        "cancel_time" : 1399114284039,        "state" : -2    }}
```

**Коды ошибок**

| Код | Описание |
| --- | --- |
| \-31003 | Транзакция не найдена. |
| \-31007 | Заказ выполнен. Невозможно отменить транзакцию. Товар или услуга предоставлена покупателю в полном объеме. |

**Возврат денег покупателю**

Если по каким-либо причинам покупатель не получил оплаченный банковской картой товар или передумал его приобретать, мерчант возвращает деньги покупателю в [личном кабинете мерчанта](https://merchant.paycom.uz/?target=_blank).

Возврат денег покупателю возможен только если реализован метод **CancelTransaction**.

---
Source: [CancelTransaction | Payme Business](https://developer.help.paycom.uz/metody-merchant-api/canceltransaction)