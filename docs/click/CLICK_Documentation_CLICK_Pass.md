# CLICK Documentation | CLICK Pass

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

### Payment status codes

| # | Error code | Description |
| --- | --- | --- |
| 1 | **<0** | Error (details in **error\_note**) |
| --- | --- | --- |
| 2 | **0** | Payment created |
| --- | --- | --- |
| 3 | **1** | Processing |
| --- | --- | --- |
| 4 | **2** | Payment successful |
| --- | --- | --- |

## Payment with CLICK Pass

### Request

**POST https://api.click.uz/v2/merchant/click\_pass/payment HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543  
{

“service\_id”: :service\_id,  
“otp\_data”: “1234567415821”,  
“amount”: 500,  
“cashbox\_code”: “KASSA-1”,  
“transaction\_id”: “12345”

}

### Request parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **otp\_data** | string | QR code contents |
| --- | --- | --- | --- |
| 3 | **amount** | float | Payment amount |
| --- | --- | --- | --- |
| 4 | **cashbox\_code** | String (optional) | Cashbox identifier |
| --- | --- | --- | --- |
| 5 | **transaction\_id** | String (optional) | Merchant transaction ID |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json  
{

“error\_code”: 0,  
“error\_note”: “Error description”,  
“payment\_id”: 1234567,  
“payment\_status”: 1,  
“confirm\_mode”: 1,  
“card\_type”:”private”,  
“processing\_type”:”UZCARD”,  
“card\_number”:”860002\*\*\*\*\*\*8331″,  
“phone\_number”:”998221234567″

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
| 5 | **confirm\_mode** | bit | Confirmation mode status |
| --- | --- | --- | --- |
| 5 | **card\_type** | string | Card type

-   private

-   corporate |
| --- | --- | --- | --- |
| 5 | **processing\_type** | string | Card processing

-   UZCARD

-   HUMO
-   WALLET (Click wallet) |
| --- | --- | --- | --- |
| 6 | **card\_number** | string | Masked card number |
| --- | --- | --- | --- |
| 7 | **phone\_number** | string | Phone number |
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

## Confirmation mode

-   Confirmation mode is enabled for the service (service\_id) and all payments via CLICK Pass for this service will work in confirmation mode.

-   Payments working in confirmation mode must be confirmed immediately after receiving a successful response to the payment.
-   Unconfirmed payments will be canceled after 30 seconds after making the payment.

## Payment confirmation

### Request

**POST https://api.click.uz/v2/merchant/click\_pass/confirm HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543  
{

“service\_id”: :service\_id,  
“payment\_id”: 1234567

}

### Response

HTTP/1.1 200 OK  
Content-Type: application/json  
{

“error\_code”: 0,  
“error\_note”: “Payment confirmed”

}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |

## Enable confirmation mode

### Request

**PUT https://api.click.uz/v2/merchant/click\_pass/confirmation/:service\_id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Response

HTTP/1.1 200 OK  
Content-Type: application/json  
{

“error\_code”: 0,  
“error\_note”: “Confirmation mode enabled”

}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |

## Disable confirmation mode

### Request

**DELETE https://api.click.uz/v2/merchant/click\_pass/confirmation/:service\_id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Response

HTTP/1.1 200 OK  
Content-Type: application/json  
{

“error\_code”: 0,  
“error\_note”: “Confirmation mode disabled”

}

### Response parameters

| # | Parameter | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |

---
Source: [CLICK Documentation | CLICK Pass](https://docs.click.uz/en/click-pass/)