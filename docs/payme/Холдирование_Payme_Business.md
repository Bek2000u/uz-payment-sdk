# Холдирование | Payme Business

## Холдирование

Для работы с холдирование вам необходимо реализовать протокол [Subscribe API](https://developer.help.paycom.uz/ru/protokol-subscribe-api) с методами создания токена карты, с которой будут сниматься средства.

Для создания платежа с холдированием необходимо указать дополнительный флаг "hold: true" в методе [receipts.create](https://developer.help.paycom.uz/ru/metody-subscribe-api/receipts.create).

**Пример запроса**

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "receipts.create",    "params": {    "account": {            "order_id": 106        },        "amount": 2500,        "hold": true,    }}
```

В методе [receipts.pay](https://developer.help.paycom.uz/ru/metody-subscribe-api/receipts.pay) флаг **hold: true** также необходим

**Пример запроса**

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 1596783866930,    "method": "receipts.pay",    "params": {        "id": "{{ProdReceiptId}}", // id транзакции        "token": "{{ProdCardToken}}", //токен карты        "hold": true    }}
```

**Пример ответа**

```
{    "jsonrpc": "2.0",    "id": 123,    "result": {        "receipt": {            "_id": "624c0c2b0ac8b463e47422c7",            "create_time": 1649150518480,            "pay_time": 0,            "cancel_time": 0,            "state": 5, //state 5 - средства захолдированы            "type": 1,            "external": false,            "operation": -1,            "category": null,            "error": null,            "description": "",            "detail": null,            "amount": 100,            "currency": 860,            "commission": 0,            "account": [                {                    "name": "order_id",                    "title": "order_id",                    "value": "5905",                    "main": true                },                {                    "name": "xEntityTaxpayerID",                    "title": "ИНН юр.лица",                    "value": "309085172"                }            ],            "sensitive_data": [],            "card": {                "number": "626247**********",                "expire": "2205"            },            "merchant": {                "_id": "623c4fe9bd1c329a32de808e",                "name": "Наименовагние компании ",                "organization": "ООО «Наименовагние компании»",                "address": "",                "business_id": "61b19ee2204c85a50a879ae1",                "epos": {                    "merchantId": "",                    "terminalId": ""                },                "date": 1648119785244,                "logo": "https://cdn.paycom.uz/merchants/8bca7f164642da3c6287122159986bebb9f98c0e.png",                "type": "Другие услуги здоровья и фармацевтики",                "terms": null            },            "meta": {                "source": "subscribe",                "owner": "623c4fe9bd1c329a32de808e"            },            "processing_id": 0        }    }}
```

Для снятия холдированных средств используется метод **receipts.confirm\_hold**

**Пример запроса**

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "receipts.confirm_hold",    "params": {        "id": "624c0c2b0ac8b463e47422c7"    }}
```

**Пример ответа**

```
{    "jsonrpc": "2.0",    "id": 9,    "result": {        "receipt": {            "_id": "624c0c2b0ac8b463e47422c7",            "create_time": 1649151033299,            "pay_time": 1649151041276,            "cancel_time": 0,            "state": 4, //state 4 - холд подтвержден, чек оплачен            "type": 1,            "external": false,            "operation": -1,            "category": null,            "error": null,            "description": "",            "detail": null,            "amount": 100,            "currency": 860,            "commission": 0,            "account": [                {                    "name": "order_id",                    "title": "order_id",                    "value": "5905",                    "main": true                },                {                    "name": "xEntityTaxpayerID",                    "title": "ИНН юр.лица",                    "value": "*********"                }            ],            "sensitive_data": [],            "card": {                "number": "860031**********",                "expire": "2609"            },            "merchant": {                "_id": "623c4fe9bd1c329a32de808e",                "name": "Наименовагние компании ",                "organization": "ООО «Наименовагние компании»",                "address": "",                "business_id": "61b19ee2204c85a50a879ae1",                "epos": {                    "merchantId": "",                    "terminalId": ""                },                "date": 1648119785244,                "logo": "https://cdn.paycom.uz/merchants/8bca7f164642da3c6287122159986bebb9f98c0e.png",                "type": "Другие услуги здоровья и фармацевтики",                "terms": null            },            "meta": {                "source": "subscribe",                "owner": "623c4fe9bd1c329a32de808e"            },            "processing_id": 0        }    }}
```

Состояние чека можно узнать [тут](https://developer.help.paycom.uz/ru/metody-subscribe-api/sostoyaniya-cheka)

Для отмены холдирования используется метод [receipts.cancel](https://developer.help.paycom.uz/ru/metody-subscribe-api/receipts.cancel)

Процессинг UZCARD отменяет холдирование по истечению 30 дней с момента холдирования

Процессинг HUMO имеет ограничение подтвреждения/отмены холдирования в течении 30 дней. По истечению 30 дней холдирование можно только подтвердить.

Для работы холдирования средств необходимо предупредить технического специалиста Payme Business. В противном случае холдирование на кассе работать не будет.

Протестировать холдирование средств можно только в боевом режиме.

---
Source: [Холдирование | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/kholdirovanie)