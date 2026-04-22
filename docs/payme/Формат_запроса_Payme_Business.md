# Формат запроса | Payme Business

## Формат запроса

Все сообщения поступают в биллинг мерчанта в виде RPC-запроса. RPC-запрос это JSON объект с полями: `method`, `params`, `id`.

| Имя | Тип | Описание |
| --- | --- | --- |
| method | String | Имя метода. |
| params | Object | Параметры метода. |
| id | Integer | Идентификатор запроса. |

**Пример RPC-запроса**

```
POST https://merchant/pay/ HTTP/1.1Content-Type: text/json; charset=UTF-8Authorization: Basic TG9naW46UGFzcw=={    "method" : "PerformTransaction",    "params" : {        "id" : "53327b3fc92af52c0b72b695",        "time" : 1399114284039,        "amount" : 500000,        "account" : {            "phone" : "903595731"        },    },    "id" : 2032}
```

---
Source: [Формат запроса | Payme Business](https://developer.help.paycom.uz/protokol-merchant-api/format-zaprosa)