# PerformTransaction | Payme Business

Метод **PerformTransaction** зачисляет средства на счет мерчанта и выставляет у заказа статус «оплачен».

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/merchant_api/PerformTransaction.png#pw)

**Параметры запроса**

| Имя | Тип | Описание |
| --- | --- | --- |
| id | ID | Идентификатор транзакции Payme Business. |

**Пример запроса**

```
{    "method" : "PerformTransaction",    "params" : {        "id" : "5305e3bab097f420a62ced0b"    }}
```

**Параметры ответа**

| Имя | Тип | Описание |
| --- | --- | --- |
| transaction | String | Номер или идентификатор транзакции в биллинге мерчанта. Формат строки определяется мерчантом. |
| perform\_time | Timestamp | Время проведения транзакции в биллинге мерчанта. |
| state | State | Состояние транзакции. |

**Пример ответа**

```
{    "result" : {        "transaction" : "5123",        "perform_time" : 1399114284039,        "state" : 2    }}
```

**Коды ошибок**

| Код | Описание |
| --- | --- |
| \-31003 | Транзакция не найдена |
| \-31008 | Невозможно выполнить данную операцию. (см. диаграмму) |
| \-31050 — -31099 | Ошибки неверного ввода данных покупателем `account`, например: не найден введёный логин, не найден введенный номер телефона и т.д. Локализованное поле `message` обязательно. Поле `data` должно содержать название субполя `account`. |

---
Source: [PerformTransaction | Payme Business](https://developer.help.paycom.uz/metody-merchant-api/performtransaction)