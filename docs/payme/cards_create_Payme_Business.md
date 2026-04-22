# cards.create | Payme Business

**Параметры запроса**

| Имя | Тип | Описание |
| --- | --- | --- |
| id | Integer | Идентификатор запроса. |
| card | Object | Параметры карты. |
| number | String | Номер карты. |
| expire | String | Срок окончания действия карты. |
| account | Object | Объект Account. Параметр не обязательный. |
| save | Boolean | Вид токена. Необязательный параметр. Параметр включается или отключается в зависимости от бизнес-логики приложения . Если флаг `true` токен можно использовать для дальнейших платежей; если флаг `false` токеном можно использовать только один раз. Одноразовый токен после оплаты удаляется. |
| customer | String | Любой идентификатор пользователя (номер телефона, uid, email) |

**Формат запроса**

```
{    card: {        number String,        expire: String    },    account: Object,    save: Boolean}
```

**Пример запроса**

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dcCache-Control: no-cache{    "id": 123,    "method": "cards.create",    "params": {        "card": { "number": "8600069195406311", "expire": "0399"},        "save": true    }}
```

**Параметры ответа**

| Имя | Тип | Описание |
| --- | --- | --- |
| id | Integer | Идентификатор ответа — соответствует идентификатору запроса. |
| number | String | Неполный номер карты. Строка может храниться на сервере мерчанта. |
| expire | String | Срок окончания действия карты. |
| token | String | Токен карты. |
| recurrent | Boolean | Флаг. Флаг определяет доступность карты для последующих платежей. |
| verify | Boolean | Флаг. Если флаг `true` карта проверена способом OTP (one time password). |

**Формат ответа**

```
{    card: {        number: String,        expire: String,        token: String,        recurrent: Boolean,        verify: Boolean    }}
```

**Пример ответа:**

```
{    "jsonrpc": "2.0",    "id": 123,    "result": {        "card": {            "number": "860006******6311",            "expire": "03/99",            "token": "NTg0YTg0ZDYyYWJiNWNhYTMxMDc5OTE0X1VnYU02ME92IUttWHVHRThJODRJNWE0Xl9EYUBPQCZjNSlPRlpLIWNWRz1PNFp6VkIpZU0kQjJkayoyVUVtUuKElmt4JTJYWj9VQGNAQyVqT1pOQ3VXZ2NyajBEMSYkYj0kVj9NXikrJE5HNiN3K25pKHRQOEVwOGpOcUYxQ2dtemk9dDUwKDNATjd2XythbibihJYoJispJUtuREhlaClraGlJWTlLMihrLStlRjd6MFI3VCgjVDlpYjQ1ZThaMiojPVNTZylYJlFWSjlEZGFuSjZDNDJLdlhXP3YmV1B2dkRDa3g5X2l4N28oU0pOVEpSeXZKYnkjK0h3ViZfdmlhUHMp",            "recurrent": true,            "verify": false        }    }}
```

---
Source: [cards.create | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/cards.create)