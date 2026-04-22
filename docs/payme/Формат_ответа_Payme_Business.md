# Формат ответа | Payme Business

Все сообщения возвращаются из биллинга мерчанта в виде RPC-ответа. RPC-ответ это JSON объект с полями: `result` или `error` и `id`.

```
HTTP/1.1 200 OKContent-Type: text/json; charset=UTF-8{    "result" : {        "id" : "1288",        "time" : 1399114284039,        "receivers" : [            {                "id" : "5305e3bab097f420a62ced0b",                "amount" : 500000            }        ]    },    "id" : 2032}
```

```
HTTP/1.1 200 OKContent-Type: text/json; charset=UTF-8{    "error" : {        "code" : -31050,        "message" : {            "ru" : "Номер телефона не найден",            "uz" : "Raqam ro'yhatda yo'q",            "en" : "Phone number not found"        },        "data" : "phone"    },    "id" : 2032}
```

---
Source: [Формат ответа | Payme Business](https://developer.help.paycom.uz/protokol-merchant-api/format-otveta)