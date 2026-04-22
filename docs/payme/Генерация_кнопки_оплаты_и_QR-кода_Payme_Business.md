# Генерация кнопки оплаты и QR-кода | Payme Business

```
<body onload="Paycom.Button('#form-payme', '#button-container')"><form id="form-payme" method="POST" action="https://checkout.paycom.uz/">    <input type="hidden" name="merchant" value="587f72c72cac0d162c722ae2">    <input type="hidden" name="account[order_id]" value="197">    <input type="hidden" name="amount" value="500">    <input type="hidden" name="lang" value="ru">    <input type="hidden" name="button" data-type="svg" value="colored">    <div id="button-container"></div></form><!-- ... --><script src="https://cdn.paycom.uz/integration/js/checkout.min.js"></script></body>
```

После нажатия кнопки или после сканирования QR-кода покупатель окажется на странице оплаты

---
Source: [Генерация кнопки оплаты и QR-кода | Payme Business](https://developer.help.paycom.uz/initsializatsiya-platezhey/generatsiya-knopki-oplaty-i-qr-koda)