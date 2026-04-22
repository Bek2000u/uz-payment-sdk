# GetStatement | Payme Business

Информация о транзакциях используется для актов сверки транзакций мерчанта и Payme Business.

Чтобы вернуть **список транзакций** за указанный период используется метод **GetStatement**.

```
{    "result" : {        "transactions" : [            {                "id" : "5305e3bab097f420a62ced0b",                "time" : 1399114284039,                "amount" : 500000,                "account" : {                    "phone" : "903595731"                },                "create_time" : 1399114284039,                "perform_time" : 1399114285002,                "cancel_time" : 0,                "transaction" : "5123",                "state" : 2,                "reason" : null,                "receivers" : [                    {                        "id" : "5305e3bab097f420a62ced0b",                        "amount" : 200000                    },                    {                        "id" : "4215e6bab097f420a62ced01",                        "amount" : 300000                    }                ]            },            ……        ]    }}
```

---
Source: [GetStatement | Payme Business](https://developer.help.paycom.uz/metody-merchant-api/getstatement)