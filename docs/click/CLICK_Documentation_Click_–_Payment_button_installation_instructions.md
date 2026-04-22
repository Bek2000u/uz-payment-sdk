# CLICK Documentation | Click – Payment button installation instructions

### Click – Payment button installation instructions

1.  [Home](https://docs.click.uz/)
2.  Click – Payment button installation instructions

![](http://83.221.163.194/wp-content/uploads/2018/05/Sequence-Button-en.png)

## Option 1 – redirect by link:

To redirect to CLICK payment page you need to create a button (link) to the following address:

`https://my.click.uz/services/pay?service_id={service_id}&merchant_id={merchant_id}&amount={amount}&transaction_param={transaction_param}&return_url={return_url}&card_type={card_type}`

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | merchant\_id | mandatory | Merchant ID |
| --- | --- | --- | --- |
| 2 | merchant\_user\_id | optional | User ID for Merchant system |
| --- | --- | --- | --- |
| 3 | service\_id | mandatory | Merchant Service ID |
| --- | --- | --- | --- |
| 4 | transaction\_param | mandatory | Order ID (for online shopping) / personal account / login in the billing of the supplier. Corresponds to [merchant\_trans\_id](https://docs.click.uz/click-api-request/#request_details) from SHOP-API |
| --- | --- | --- | --- |
| 5 | amount | mandatory | Transaction amount (format: N.NN) |
| --- | --- | --- | --- |
| 6 | return\_url | optional | The link where user will be redirected after the payment |
| --- | --- | --- | --- |
| 7 | card\_type | optional | Type of payment system (uzcard, humo) |
| --- | --- | --- | --- |

Button styling example (CSS) is shown in Option 2

## Option 2 – redirect by HTML form:

`<form action="https://my.click.uz/services/pay" method="get" target="_blank">`  
                                    `<button typo="submit" class="pay_with_click"><i></i>Оплатить через CLICK</button>`  
                                    `<input type=”hidden” name=”KEY” value=”VALUE” />`  
                                    `<input type=”hidden” name=”KEY” value=”VALUE” />`  
                                    `…`  
`</form>`

For the purposes of interaction between the merchant’s website and CLICK payment interface the following parameters with *hidden* fields have to be passed:

| # | Parameter name | Data type | Description |
| --- | --- | --- | --- |
| 1 | merchant\_id | mandatory | Merchant ID |
| --- | --- | --- | --- |
| 2 | merchant\_user\_id | optional | User ID for Merchant system |
| --- | --- | --- | --- |
| 3 | service\_id | mandatory | Merchant Service ID |
| --- | --- | --- | --- |
| 4 | transaction\_param | mandatory | Order ID (for online shopping) / personal account / login in the billing of the supplier. Corresponds to [merchant\_trans\_id](https://docs.click.uz/click-api-request/#request_details) from SHOP-API |
| --- | --- | --- | --- |
| 5 | amount | mandatory | Transaction amount (format: N.NN) |
| --- | --- | --- | --- |
| 6 | return\_url | optional | The link where user will be redirected after the payment |
| --- | --- | --- | --- |
| 7 | card\_type | optional | Type of payment system (uzcard, humo) |
| --- | --- | --- | --- |

### Form example (PHP Code):

`**<?**`  
`$merchantID = 20; *//It’s necessary to replace the parameter with the new* *ID*`  
`$merchantUserID = 4;`  
`$serviceID = 31;  $transID = "user23151";`  
`$transAmount = number_format(1000, 2, '.', '');`  
`$returnURL = "merchant website url";`  
`$HTML = *<<<CODE*`  
`*<form action="https://my.click.uz/services/pay" id=”click_form” method="get" target="_blank">*`  
                                    `*<input type="hidden" name="amount" value="$transAmount" />*`  
                                    `*<input type="hidden" name="merchant_id" value="$merchantID"/>*`  
                                    `*<input type="hidden" name="merchant_user_id" value="$merchantUserID"/>*`  
                                    `*<input type="hidden" name="service_id" value="$serviceID"/>*`  
                                    `*<input type="hidden" name="transaction_param" value="$transID"/>*`  
                                    `*<input type="hidden" name="return_url" value="$returnURL"/>*`  
                                    `*<input type="hidden" name="card_type" value="$cardType"/>*`  
                                    `*<button type="submit" class="click_logo"><i></i>**Pay* *with* *CLICK</button>*`  
`*</form>*`  
`*CODE*;`

### Example of the final HTML code:

`<form id="click_form" action="https://my.click.uz/services/pay" method="get" target="_blank">`  
  `<input type="hidden" name="amount" value="1000" />`  
  `<input type="hidden" name="merchant_id" value="46"/>`  
  `<input type="hidden" name="merchant_user_id" value="4"/>`  
  `<input type="hidden" name="service_id" value="36"/>`  
  `<input type="hidden" name="transaction_param" value="user23151"/>`  
  `<input type="hidden" name="return_url" value="merchant website url"/>`  
  `<input type="hidden" name="card_type" value="uzcard/humo"/>`  
  `<button type="submit" class="click_logo"><i></i>Pay with CLICK</button>`  
`</form>`

### CSS code for the button:

`click_logo {`  
  `padding:4px 10px;`  
  `cursor:pointer;`  
  `color: #fff;`  
  `line-height:190%;`  
  `font-size: 13px;`  
  `font-family: Arial;`  
  `font-weight: bold;`  
  `text-align: center;`  
  `border: 1px solid #037bc8;`  
  `text-shadow: 0px -1px 0px #037bc8;`  
  `border-radius: 4px;`  
  `background: #27a8e0;`  
  `background:   url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/Pgo8c3ZnIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgdmlld0JveD0iMCAwIDEgMSIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+CiAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkLXVjZ2ctZ2VuZXJhdGVkIiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPgogICAgPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzI3YThlMCIgc3RvcC1vcGFjaXR5PSIxIi8+CiAgICA8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMxYzhlZDciIHN0b3Atb3BhY2l0eT0iMSIvPgogIDwvbGluZWFyR3JhZGllbnQ+CiAgPHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0idXJsKCNncmFkLXVjZ2ctZ2VuZXJhdGVkKSIgLz4KPC9zdmc+);`  
  `background: -webkit-gradient(linear, 0 0, 0 100%, from(#27a8e0), to(#1c8ed7));`  
  `background: -webkit-linear-gradient(#27a8e0 0%, #1c8ed7 100%);`  
  `background: -moz-linear-gradient(#27a8e0 0%, #1c8ed7 100%);`  
  `background: -o-linear-gradient(#27a8e0 0%, #1c8ed7 100%);`  
  `background: linear-gradient(#27a8e0 0%, #1c8ed7 100%);`  
  `box-shadow:  inset    0px 1px 0px   #45c4fc;`  
  `filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#27a8e0', endColorstr='#1c8ed7',GradientType=0 );`  
  `-webkit-box-shadow: inset 0px 1px 0px #45c4fc;`  
  `-moz-box-shadow: inset  0px 1px 0px  #45c4fc;`  
  `-webkit-border-radius:4px;`  
  `-moz-border-radius: 4px;`  
`}`

`.click_logo i {`  
  `background: url(*https://m.click.uz/static/img/logo.png*) no-repeat top left;`  
  `width:30px;`  
  `height: 25px;`  
  `display: block;`  
  `float: left;`  
`}`

---
Source: [Click – Payment button installation instructions](https://docs.click.uz/en/click-button/)