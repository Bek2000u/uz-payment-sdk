# receipts.pay | Payme Business

```
id: String,token: String,payer: {    id: String,    phone: String,    email: String,    name: String,    ip: String}
```

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "receipts.pay",    "params": {        "id": "2e0b1bc1f1eb50d487ba268d",        "token": "NTg1Yjc4OWMyYWJiNWNhYTMxMDc5YTE0X3hCJjc/M0NPejR4Jks5JmIxK2QkNCFHJXUqRyplIUB4MHpKVnUxOXZuRHVXK3h3XmVudS1hJFhON01ISSZBUV4jciQ4UD1YdFM4R0F0SmIkK3dfRlXihJYmI2F1MSpYNGNUVFViZkRtekZDNnU3XyElcERtdjRKXmtibWdFYjVpIVF0VW9NZWgzbyN5ZWhGRTdOQkBGU0JhS2ooR1dHZV5pWlJWZCVOekR2VHlJSmh5aSNxdVVXXnp2QUQmanVwb0AxbU1XcEMrcStPRUZQR1ZUTVllVTBeSGNEZkc/OD09JWleVEtqYUE4Y08rJloqVURLcG1rdiZEWCNJUk09dC1KKQ==",        "payer": {            "phone": "998901304527"        }    }}
```

```
{  "jsonrpc": "2.0",  "id": null,  "result": {    "receipt": {      "_id": "2e0b1bc1f1eb50d487ba268d",      "create_time": 1481113810044,      "pay_time": 1481113810265,      "cancel_time": 0,      "state": 4,      "type": 1,      "external": false,      "operation": -1,      "category": null,      "error": null,      "description": "",      "detail": null,      "amount": 3500,      "commission": 0,      "account": [        {          "name": "order_id",          "title": "Код заказа",          "value": "5"        }      ],      "card": {        "number": "860006******6311",        "expire": "0399"      },      "merchant": {        "_id": "100fe486b33784292111b7dc",        "name": "Online Shop LLC",        "organization": "ЧП «Online Shop»",        "address": "",        "epos": {          "merchantId": "106600000050000",          "terminalId": "20660000"        },        "date": 1480582278779,        "logo": null,        "type": "Shop",        "terms": null,        "payer": {                    "phone": "998912345678"         }      },      "meta": null    }  }}
```

---
Source: [receipts.pay | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/receipts.pay)