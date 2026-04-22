# cards.verify | Payme Business

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dcCache-Control: no-cache{    "id": 123,    "method": "cards.verify",    "params": {        "token": "NTg0YTg0ZDYyYWJiNWNhYTMxMDc5OTE0X1VnYU02ME92IUttWHVHRThJODRJNWE0Xl9EYUBPQCZjNSlPRlpLIWNWRz1PNFp6VkIpZU0kQjJkayoyVUVtUuKElmt4JTJYWj9VQGNAQyVqT1pOQ3VXZ2NyajBEMSYkYj0kVj9NXikrJE5HNiN3K25pKHRQOEVwOGpOcUYxQ2dtemk9dDUwKDNATjd2XythbibihJYoJispJUtuREhlaClraGlJWTlLMihrLStlRjd6MFI3VCgjVDlpYjQ1ZThaMiojPVNTZylYJlFWSjlEZGFuSjZDNDJLdlhXP3YmV1B2dkRDa3g5X2l4N28oU0pOVEpSeXZKYnkjK0h3ViZfdmlhUHMp",        "code": "666666"    }}
```

```
{  "jsonrpc": "2.0",  "id": 123,  "result": {    "card": {      "number": "860006******6311",      "expire": "03/99",      "token": "NTg0YTgxZWYyYWJiNWNhYTMxMDc5OTExXyVwOTY4TzI3MTJRQ28lWmsoREEyRClYOCtxZ18kVWRLRm0xP3FucVUzJChZazhFV3I1dmtrQiZUaFU5MzZRdSlGbUJPSEh2K1IoWU0lYSg3ZEYlK1QhTUV4P3pUU+KElkMkXjNuIUR6U19pdjY4b3Ffbkt3ajImZTRhZll0dUptNjBVMUF4KXJKJD0qTlNeQmJ5X2Q3bXZNRnZ2UXhfU25TS0dpcGc9V1doUEZxKSM5R0dJYjA9U2dGX2ReZ3lATeKElj9mZWZJS3MzKVp5MjFeOVY5cE8jZWh6cHZLeWZXKSF2PVBfVVU4ei1Gbj82JkI3YjhuRCFWa1omaDB4JEliQm8h",      "recurrent": true,      "verify": true    }  }}
```

---
Source: [cards.verify | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/cards.verify)