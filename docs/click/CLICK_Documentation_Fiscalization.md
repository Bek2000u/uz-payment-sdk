# CLICK Documentation | Fiscalization

## Fiscalization of goods and services

### Request

**POST https://api.click.uz/v2/merchant/payment/ofd\_data/submit\_items HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543  
{  
“service\_id”: Service Identifier,  
“payment\_id”: Payment Identifier,  
“items”: items or services list,  
“received\_ecash”: amount paid by e-cash,  
“received\_cash”: amount paid by cash,  
“received\_card”: amount paid by card  
}

### Request parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service ID |
| --- | --- | --- | --- |
| 2 | **payment\_id** | long | Payment ID |
| --- | --- | --- | --- |
| 3 | **items** | Item | Items or services list |
| --- | --- | --- | --- |
| 4 | **received\_ecash** | integer | Amount paid by e-cash in tiyins (1⁄100 of a soum) |
| --- | --- | --- | --- |
| 5 | **received\_cash** | integer | Amount paid by cash in tiyins (1⁄100 of a soum) |
| --- | --- | --- | --- |
| 6 | **received\_card** | integer | Amount paid by card in tiyins (1⁄100 of a soum) |
| --- | --- | --- | --- |

 **items** is mandatory and should contain at least one item

**Item****:**

| ***Parameter name*** | ***Data type*** | ***Description*** |
| ***Name*** | \* string(63) | Item/service name with units at the end |
| ***Barcode*** | string(13) | Barcode |
| ***Labels*** | \[300\]string(21) | Array of marking codes (max. 300 elements) |
| ***SPIC*** | \* string(17) | SPIC code |
| ***Units*** | uint64 | Unit code |
| ***PackageCode*** | \* string(20) | Package Code |
| ***GoodPrice*** | *uint64* | Price of one product/service unit |
| ***Price*** | \* uint64 | The total amount of the item, including quantity and excluding discounts (in tiyin) |
| ***Amount*** | \* uint64 | Quantity |
| ***VAT*** | \* uint64 | Amount of VAT (in tiyin) |
| ***VATPercent*** | \* byte | VAT percentage % |
| ***Discount*** | uint64 | Discount |
| ***Other*** | uint64 | Other discounts |
| ***CommissionInfo*** | **\* CommissionInfo** | Information about the commission check |

Parameters marked with  \* are mandatory

**CommissionInfo**

| ***Parameter name*** | ***Data type*** | ***Description*** |
| ***TIN*** | string(9) | TIN |
| ***PINFL*** | string(14) | PINFL |

**CommissionInfo** must contain **TIN** or **PINFL**

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: код ошибки,  
“error\_note”: “Описание ошибки”  
}

### Response parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |

## Registering already fiscalized check

### Request

**POST https://api.click.uz/v2/merchant/payment/ofd\_data/submit\_qrcode HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543  
{  
“service\_id”: Service Identifier,  
“payment\_id”: Payment Identifier,  
“qrcode”: “https://ofd.soliq.uz/epi?t=EZ000000000030&r=123456789&c=20221028171340&s=854971301623”  
}

### Request parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service Id |
| --- | --- | --- | --- |
| 2 | **payment\_id** | long | Payment Id |
| --- | --- | --- | --- |
| 3 | **qrcode** | string | Check URL |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“error\_code”: Error code,  
“error\_note”: “Error description”  
}

### Response parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **error\_code** | integer | Error code |
| --- | --- | --- | --- |
| 2 | **error\_note** | string | Error description |
| --- | --- | --- | --- |

## Retrieving fiscal data (URL)

### Request

**GET https://api.click.uz/v2/merchant/payment/ofd\_data/:service\_id/:payment\_id HTTP/1.1**  
Accept: application/json  
Content-Type: application/json  
Auth: 123:356a192b7913b04c54574d18c28d46e6395428ab:1519051543

### Request parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **service\_id** | integer | Service Id |
| --- | --- | --- | --- |
| 2 | **payment\_id** | long | Payment Id |
| --- | --- | --- | --- |

### Response

HTTP/1.1 200 OK  
Content-Type: application/json

{  
“paymentId”: 1946296773,  
“qrCodeURL”: “https://ofd.soliq.uz/epi?t=EZ000000000030&r=123456789&c=20221028171340&s=854971301623”  
}

### Response parameters

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | **paymentId** | long | Payment Id |
| --- | --- | --- | --- |
| 2 | **qrCodeURL** | string | URL |
| --- | --- | --- | --- |

---
Source: [CLICK Documentation | Fiscalization](https://docs.click.uz/en/fiscalization/)