# CLICK Documentation | Merchant – Request

## Connection and making requests

### API Endpoint

https://api.click.uz/v2/merchant/

### Private Data

Upon registration, service provider receives following data to connect and make requests to an API:

-   merchant\_id

-   service\_id
-   merchant\_user\_id

-   secret\_key

secret\_key parameter is private and service provider is fully responsible for its safety.  
Exposing secret\_key may end up in compromising your data.

### Authentication

HTTP Header “Auth: merchant\_user\_id:digest:timestamp”  
**digest** – sha1(timestamp + secret\_key)  
timestamp – UNIX timestamp (10 digit seconds from epoch start)

### Required headers

Accept  
Auth  
Content-Type

### Supported content types

application/json  
application/xml

## Create invoice

### Request

**POST https://api.click.uz/v2/merchant/invoice/create HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

{  
“service\_id”: :service\_id,  
“amount”: :amount,  
“phone\_number”: :phone\_number,  
“merchant\_trans\_id”: :merchant\_trans\_id  
}

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **amount** | float | Requested amount |
| --- | --- | --- | --- |
| 3 | **phone\_number** | string | Invoice receiver |
| --- | --- | --- | --- |
| 4 | **merchant\_trans\_id** | string | Order ID (for online shopping) / personal account / login in the billing of the supplier |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“invoice\_id”: 1234567  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **invoice\_id** | bigint | Invoice Identifier |
| --- | --- | --- | --- |

## Invoice status check

### Request

**GET https://api.click.uz/v2/merchant/invoice/status/:service\_id/:invoice\_id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“invoice\_status”: -99,  
“invoice\_status\_note”: “Deleted”,  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **invoice\_status** | bigint | Invoice status code |
| --- | --- | --- | --- |
| 4 | **invoice\_status\_note** | int | Status description |
| --- | --- | --- | --- |

## Payment status check

### Request

**GET https://api.click.uz/v2/merchant/payment/status/:service\_id/:payment\_id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **payment\_id** | bigint | Payment ID |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“payment\_id”: 1234567,  
“payment\_status”: 1  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **payment\_id** | bigint | Payment Identifier |
| --- | --- | --- | --- |
| 4 | **payment\_status** | int | Payment status code |
| --- | --- | --- | --- |

## Payment status check by merchant\_trans\_id

### Request

**GET https://api.click.uz/v2/merchant/payment/status\_by\_mti/:service\_id/:merchant\_trans\_id/:YYYY-MM-DD HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:15190515

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **merchant\_trans\_id** | string | Merchant transaction ID |
| --- | --- | --- | --- |
| 3 | **YYYY-MM-DD** | string | Payment date |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“payment\_id”: 1234567,  
“merchant\_trans\_id”: “user123”  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **payment\_id** | bigint | Payment Identifier |
| --- | --- | --- | --- |
| 4 | **payment\_status** | int | Payment status code |
| --- | --- | --- | --- |

## Payment reversal (cancel)

### Request

**DELETE https://api.click.uz/v2/merchant/payment/reversal/:service\_id/:payment:id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **payment\_id** | bigint | Payment ID |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“payment\_id”: 1234567  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **payment\_id** | bigint | Payment Identifier |
| --- | --- | --- | --- |

### Reversal conditions

-   Payment should be successfully completed

-   Only payments created in current reporting month can be reverted
-   Payments from previous month can be canceled only on first day of current month.  Payment should be made with Online card.

-   Payment reversal can be denied due to refusal by UZCARD

## Create card token

### Request

**POST https://api.click.uz/v2/merchant/card\_token/request HTTP/1.1**  
Accept: application/json  
Content-Type: application/json

{  
“service\_id”: :service\_id,  
“card\_number”: :card\_number,  
“expire\_date”: :expire\_date, // (MMYY)  
“temporary”: 1 // (0|1)  
}

*temporary – create token for one time use.  
Temporary tokens are automatically removed after payment.*

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **card\_number** | string | Card number |
| --- | --- | --- | --- |
| 3 | **expire\_date** | string | Card expire date |
| --- | --- | --- | --- |
| 4 | **temporary** | bit | Create temporary card |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“card\_token”: “3B1DF3F1-7358-407C-B57F-0F6351310803”,  
“phone\_number”: “99890\*\*\*1234”,  
“temporary”: 1,  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **card\_token** | string | Card token |
| --- | --- | --- | --- |
| 4 | **phone\_number** | string | User phone number |
| --- | --- | --- | --- |
| 4 | **temporary** | bit | Type of created token |
| --- | --- | --- | --- |

## Verify card token

### Request

**POST https://api.click.uz/v2/merchant/card\_token/verify HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

{  
“service\_id”: :service\_id,  
“card\_token”: :card\_token,  
“sms\_code”: :sms\_code  
}

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **card\_token** | string | Card token |
| --- | --- | --- | --- |
| 3 | **sms\_code** | int | Recevied sms code |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“card\_number”: “8600 55\*\* \*\*\*\* 3244”,  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **card\_number** | string | Card number |
| --- | --- | --- | --- |

## Payment with token

### Request

**POST https://api.click.uz/v2/merchant/card\_token/payment HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

{  
“service\_id”: :service\_id,  
“card\_token”: :card\_token,  
“amount”: :amount,  
“transaction\_parameter”: :merchant\_trans\_id  
}

*transaction\_parameter – user or contract identifier on merchant billing*

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **card\_token** | string | Card token |
| --- | --- | --- | --- |
| 2 | **amount** | float | Payment amount |
| --- | --- | --- | --- |
| 3 | **merchant\_trans\_id** | string | Merchant transaction ID |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”,  
“payment\_id”: “598761234”,  
“payment\_status”: 1  
}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |
| 3 | **payment\_id** | bigint | Payment Identifier |
| --- | --- | --- | --- |
| 4 | **payment\_status** | int | Payment status code |
| --- | --- | --- | --- |

## Delete card token

### Request

**DELETE https://api.click.uz/v2/merchant/card\_token/:service\_id/:card\_token HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **card\_token** | string | Card token |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: error\_code,  
“error\_note”: “Error description”  
}

---
Source: [CLICK Documentation | Merchant – Request](https://docs.click.uz/en/merchant-api-request/)