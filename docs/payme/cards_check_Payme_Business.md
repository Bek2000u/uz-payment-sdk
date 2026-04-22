# cards.check | Payme Business

```
POST /api HTTP/1.1Host: checkout.test.paycom.uzX-Auth: 100fe486b33784292111b7dcContent-Type: application/jsonCache-Control: no-cache{    "id": 123,    "method": "cards.check",    "params": {        "token": "NTg1Yjc4OWMyYWJiNWNhYTMxMDc5YTE0X3hCJjc/M0NPejR4Jks5JmIxK2QkNCFHJXUqRyplIUB4MHpKVnUxOXZuRHVXK3h3XmVudS1hJFhON01ISSZBUV4jciQ4UD1YdFM4R0F0SmIkK3dfRlXihJYmI2F1MSpYNGNUVFViZkRtekZDNnU3XyElcERtdjRKXmtibWdFYjVpIVF0VW9NZWgzbyN5ZWhGRTdOQkBGU0JhS2ooR1dHZV5pWlJWZCVOekR2VHlJSmh5aSNxdVVXXnp2QUQmanVwb0AxbU1XcEMrcStPRUZQR1ZUTVllVTBeSGNEZkc/OD09JWleVEtqYUE4Y08rJloqVURLcG1rdiZEWCNJUk09dC1KKQ=="    }}
```

```
{    card: {        number: String,        expire: String,        token: String,        recurrent: Boolean,        verify: Boolean    }}
```

```
{    "jsonrpc": "2.0",    "id": 123,    "result": {        "card": {          "number": "860006******6311",          "expire": "03/99",            "token": "NTg1Yjc4OWMyYWJiNWNhYTMxMDc5YTE0X3hCJjc/M0NPejR4Jks5JmIxK2QkNCFHJXUqRyplIUB4MHpKVnUxOXZuRHVXK3h3XmVudS1hJFhON01ISSZBUV4jciQ4UD1YdFM4R0F0SmIkK3dfRlXihJYmI2F1MSpYNGNUVFViZkRtekZDNnU3XyElcERtdjRKXmtibWdFYjVpIVF0VW9NZWgzbyN5ZWhGRTdOQkBGU0JhS2ooR1dHZV5pWlJWZCVOekR2VHlJSmh5aSNxdVVXXnp2QUQmanVwb0AxbU1XcEMrcStPRUZQR1ZUTVllVTBeSGNEZkc/OD09JWleVEtqYUE4Y08rJloqVURLcG1rdiZEWCNJUk09dC1KKQ==",            "recurrent": true,            "verify": true        }    }}
```

---
Source: [cards.check | Payme Business](https://developer.help.paycom.uz/metody-subscribe-api/cards.check)