# receipts.set_fiscal_data | Payme Business

```
{    "id": Integer,    "method": "receipts.set_fiscal_data",    "params": {        "id": String,        "fiscal_data": {            "status_code": Integer,            "message": String,            "terminal_id": String,            "receipt_id": Integer,            "date": String,            "fiscal_sign": String,            "qr_code_url": String,        }    }}
```

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:mjES8ycLucnvygt4dPwerK2vj45Eensn3ZPrCache-Control: no-cache{    "id": 123,    "method": "receipts.set_fiscal_data",    "params": {        "id": "2e0b1bc1f1eb50d487ba268d",        "fiscal_data": {            "status_code": 0;                      "message": "accepted";                 "terminal_id": "EP000000000025";             "receipt_id": 121;                          "date": "20220706221021";                         "fiscal_sign": "800031554082";               "qr_code_url": "fiscal receipt url";        }    }}
```

---
Source: [receipts.set_fiscal_data | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/receipts.set_fiscal_data)