# CLICK Documentation | Click – Payment by card without redirection to payment page

### Click – Payment by card without redirection to payment page

1.  [Home](https://docs.click.uz/)
2.  Click – Payment by card without redirection to payment page

## To add payment button to your site (1-st option)

Add tag “<script …” into your payment form to automatically generate payment button.

`<form method="post" action="/your-after-payment-url">`  
          `<script src="https://my.click.uz/pay/checkout.js"`  
                    `class="uzcard_payment_button"`  
                    `data-service-id="MERCHANT_SERVICE_ID"`  
                    `data-merchant-id="MERCHANT_ID"`  
                    `data-transaction-param="MERCHANT_TRANS_ID"`  
                    `data-merchant-user-id="MERCHANT_USER_ID"`  
                    `data-amount="MERCHANT_TRANS_AMOUNT"`  
                    `data-card-type="MERCHANT_CARD_TYPE"`  
                    `data-label="Pay" <!-- Payment button title -->`  
          `></script>`  
`</form>`

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | MERCHANT\_ID | mandatory | Merchant ID |
| --- | --- | --- | --- |
| 2 | MERCHANT\_USER\_ID | optional | User ID for Merchant system |
| --- | --- | --- | --- |
| 3 | MERCHANT\_SERVICE\_ID | mandatory | Merchant Service ID |
| --- | --- | --- | --- |
| 4 | MERCHANT\_TRANS\_ID | mandatory | Order ID (for online shopping) / personal account / login in the billing of the supplier. Corresponds to [merchant\_trans\_id](https://docs.click.uz/click-api-request/#request_details) from SHOP-API |
| --- | --- | --- | --- |
| 5 | MERCHANT\_TRANS\_AMOUNT | mandatory | Transaction amount (format: N.NN) |
| --- | --- | --- | --- |
| 6 | MERCHANT\_CARD\_TYPE | optional | Type of payment system (uzcard, humo) |
| --- | --- | --- | --- |

After payment is complete in the payment window, the form will be submitted to the server with additional parameter “status”.

## Create payment window from code (2-nd option)

Call method “createPaymentRequest” whitch takes two parameters:

1.  Payment parameters object
2.  Callback-function, which is called after payment window is closed. It takes object with “status” field.

`<script src="https://my.click.uz/pay/checkout.js"/>`  
`<script>`  
`window.onload = function() {`  
          `var linkEl = document.querySelector(".input-btn");`  
          `linkEl.addEventListener("click", function() {`  
                    `createPaymentRequest({`  
                              `service_id: MERCHANT_SERVICE_ID,`  
                              `merchant_id: MERCHANT_ID,`  
                              `amount: MERCHANT_TRANS_AMOUNT,`  
                              `transaction_param: "MERCHANT_TRANS_ID",`  
                              `merchant_user_id: "MERCHANT_USER_ID",`  
                              `card_type: "MERCHANT_CARD_TYPE",`  
                    `}, function(data) {`  
                              `console.log("closed", data.status);`  
                    `});`  
          `});`  
`};`  
`</script>`

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | MERCHANT\_ID | mandatory | Merchant ID |
| --- | --- | --- | --- |
| 2 | MERCHANT\_USER\_ID | optional | User ID for Merchant system |
| --- | --- | --- | --- |
| 3 | MERCHANT\_SERVICE\_ID | mandatory | Merchant Service ID |
| --- | --- | --- | --- |
| 4 | MERCHANT\_TRANS\_ID | mandatory | Order ID (for online shopping) / personal account / login in the billing of the supplier. Corresponds to [merchant\_trans\_id](https://docs.click.uz/click-api-request/#request_details) from SHOP-API |
| --- | --- | --- | --- |
| 5 | MERCHANT\_TRANS\_AMOUNT | mandatory | Transaction amount (format: N.NN) |
| --- | --- | --- | --- |
| 6 | MERCHANT\_CARD\_TYPE | optional | Type of payment system (uzcard, humo) |
| --- | --- | --- | --- |

Possible values for “status” field:

1.  status < 0 – Error
2.  status = 0 – Payment is created
3.  status = 1 – Payment is being processed
4.  status = 2 – Payment is made successfully

---
Source: [Click – Payment by card without redirection to payment page](https://docs.click.uz/en/click-pay-by-card/)