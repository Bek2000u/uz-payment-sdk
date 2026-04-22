# Отправка чека по методу GET | Payme Business

Методом GET чек отправляется в виде URL:

-   Формат URL - `<checkout_url>/base64(params)`
    
-   Разделитель параметров - `;`
    
-   Формат параметров - `key=value`
    

**Параметры**

| Параметр | Описание |
| --- | --- |
| m | ID или алиас мерчанта. |
| ac | Объект Account. |
| a | Сумма платежа (указывается в тийинах). |
| l | Язык. Доступные значения: ru, uz, en. |
| c | URL адрес возврата после оплаты или отмены платежа. |
| ct | Время ожидания после успешного платежа в миллисекундах, до возврата покупателя на сайт мерчанта. |
| cr | Код валюты в ISO формате |

**Пример формирования URL**

Данные:

`m=587f72c72cac0d162c722ae2` — ID мерчанта

`ac.order_id=197` — Код заказа ( order\_id — параметр объекта Account в настройках веб кассы)

`a=500` — Сумма платежа 5 сум (в тийинах)

Пример сформированного URL: `https://checkout.paycom.uz/base64(m=587f72c72cac0d162c722ae2;ac.order_id=197;a=500)`

Результат:

```
https://checkout.paycom.uz/bT01ODdmNzJjNzJjYWMwZDE2MmM3MjJhZTI7YWMub3JkZXJfaWQ9MTk3O2E9NTAw
```

Пример формы по сформированному URL:

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/payment_initialization/checkout-get-method-response.png#pw)

---
Source: [Отправка чека по методу GET | Payme Business](https://developer.help.paycom.uz/initsializatsiya-platezhey/otpravka-cheka-po-metodu-get)