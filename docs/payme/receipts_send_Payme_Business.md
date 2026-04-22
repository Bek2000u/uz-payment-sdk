# receipts.send | Payme Business

Метод используется для отправки чека на оплату в SMS-сообщении.

**Параметры запроса**

| Параметр | Тип | Описание |
| --- | --- | --- |
| id | String | ID Чека |
| phone | String | Номер телефона получателя инвойса |

**Формат запроса**

```
{    id: String,    phone: string}
```

**Пример запроса**

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dc:Rw712wMJspZBczFvrG09?bHkSNxnD4PY0n1CContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "receipts.send",    "params": {        "id": "2e0b1bc1f1eb50d487ba268d",        "phone": "998901304527"    }}
```

**Формат ответа**

```
{   "result": {    "success":  boolean  }}
```

**Пример ответа**

```
{  "jsonrpc": "2.0",  "result": {    "success": true  }}
```

---
Source: [receipts.send | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/receipts.send)