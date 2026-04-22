# receipts.get | Payme Business

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "receipts.get",    "params": {        "id": "2e0b1bc1f1eb50d487ba268d"    }}
```

```
{    "jsonrpc": "2.0",    "id": 123,    "result": {        "receipt": {            "_id": "2e0b1bc1f1eb50d487ba268d",            "create_time": 1482823890336,            "pay_time": 1482823890564,            "cancel_time": 0,            "state": 4,            "type": 1,            "external": false,            "operation": -1,            "category": null,            "error": null,            "description": "",            "detail": null,            "amount": 2000,            "commission": 0,            "account": [                {                    "name": "order_id",                    "title": "Код заказа",                    "value": "124"                }            ],            "card": null,            "merchant": {                "_id": "100fe486b33784292111b7dc",                "name": "Online Shop LLC",                "organization": "ЧП «Online Shop»",                "address": "",                "epos": {                    "merchantId": "106600000050000",                    "terminalId": "20660000"                },                "date": 1480582278779,                "logo": null,                "type": "Shop",                "terms": null,                "payer": {                    "phone": "998912345678"                }            },            "meta": null        }    }}
```

---
Source: [receipts.get | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/receipts.get)