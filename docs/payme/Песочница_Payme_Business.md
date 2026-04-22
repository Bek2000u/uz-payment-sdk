# Песочница | Payme Business

## Песочница

[О песочнице](https://developer.help.paycom.uz/pesochnitsa#%D0%BE-%D0%BF%D0%B5%D1%81%D0%BE%D1%87%D0%BD%D0%B8%D1%86%D0%B5)

[Подготовка к тестированию](https://developer.help.paycom.uz/pesochnitsa#%D0%BF%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B0-%D0%BA-%D1%82%D0%B5%D1%81%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8E)

[Тестирование](https://developer.help.paycom.uz/pesochnitsa#%D1%82%D0%B5%D1%81%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5)

к сведению

Тестирование на рабочем сервере создает дополнительную нагрузку. Учетные записи, которые связаны с некорректно работающими приложениями, блокируются.

##### О песочнице[​](https://developer.help.paycom.uz/pesochnitsa#%D0%BE-%D0%BF%D0%B5%D1%81%D0%BE%D1%87%D0%BD%D0%B8%D1%86%D0%B5 "Прямая ссылка на этот заголовок")

Песочница — среда для безопасного тестирования реализованного [Merchant API](https://developer.help.paycom.uz/protokol-merchant-api). Тесты в песочнице помогут проверить взаимодействие реализованного API с Payme Business. Тестирование в песочнице позволяет получить детальное описание возникающих [ошибок](https://developer.help.paycom.uz/protokol-merchant-api/obschie-oshibki).

Инициирует тестирование и запускает тесты — разработчик мерчанта. Тестирование проводится с помощью [запросов](https://developer.help.paycom.uz/protokol-merchant-api/format-zaprosa) и [ответов](https://developer.help.paycom.uz/protokol-merchant-api/format-otveta). Запросы отправляет сервер Payme Business, ответы — сервер мерчанта.

##### Подготовка к тестированию[​](https://developer.help.paycom.uz/pesochnitsa#%D0%BF%D0%BE%D0%B4%D0%B3%D0%BE%D1%82%D0%BE%D0%B2%D0%BA%D0%B0-%D0%BA-%D1%82%D0%B5%D1%81%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8E "Прямая ссылка на этот заголовок")

Добавьте веб кассу в кабинете мерчанта. После создания веб-кассы, Payme Business выдаст 2 ключа:

-   ключ для кабинета — key;
    
-   ключ для песочницы — TEST\_KEY.
    

Перейдите в [песочницу](https://test.paycom.uz/?target=_blank). В песочнице введите Merchant ID (ID веб-кассы) и TEST\_KEY.

к сведению

Merchant ID хранится в параметрах разработчика веб-кассы.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/test_key.png#pw)

к сведению

Важно чтобы в настройках кассы был указан Endpoint URL — веб-адрес биллинга. По этому адресу Payme Business будет посылать запросы.

При создании транзакций в песочнице, важно правильно указать тип счёта:

-   На **накопительный счёт** деньги могут поступать неограниченное количество раз. Пример накопительного счёта — счет мобильного оператора;
    
-   На **одноразовый счёт**, деньги могут поступать только 1 раз. Пример одноразового счёта — заказ в интернет магазине.
    

к сведению

Тестирование [инициализации платежа](https://developer.help.paycom.uz/initsializatsiya-platezhey) рекомендуется проводить только после успешного завершения тестирования в песочнице: вначале протестируйте инициализацию платежа в песочнице, затем в продакшене.

**Веб-адрес песочницы:** [https://test.paycom.uz](https://test.paycom.uz/)

**URL отправки чека в песочницу:** [https://test.paycom.uz](https://test.paycom.uz/)

**URL отправки чека в продакшн:** [https://checkout.paycom.uz](https://checkout.paycom.uz/)

##### Тестирование[​](https://developer.help.paycom.uz/pesochnitsa#%D1%82%D0%B5%D1%81%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D0%B5 "Прямая ссылка на этот заголовок")

Тестирование проводится по 2 сценариям:

1.  [Создание и отмена неподтвержденной транзакции](https://developer.help.paycom.uz/pesochnitsa#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%B8-%D0%BE%D1%82%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BD%D0%B5%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8)
    
2.  [Создание, подтверждение и отмена подтверждённой финансовой транзакции](https://developer.help.paycom.uz/pesochnitsa#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B8-%D0%BE%D1%82%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8)
    

В первый сценарий включена проверка безопасности, поэтому вначале проводится тестирование по первому сценарию, затем по второму.

к сведению

В платёжном плагине Merchant API уже реализовано, поэтому тестирование платёжного плагина проводится по тем же сценариям.

##### Создание и отмена неподтвержденной транзакции[​](https://developer.help.paycom.uz/pesochnitsa#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%B8-%D0%BE%D1%82%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BD%D0%B5%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8 "Прямая ссылка на этот заголовок")

Войдите в магазин как покупатель. Добавьте товар в корзину и оплатите заказ с помощью Payme. После оплаты произойдёт автоматический переход в «Песочницу» на страницу создания финансовой транзакции.

**Проверьте авторизацию с неверными учетными данными**

В разделе «Неверные данные» нажмите на ссылку «Неверная авторизация» и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_1.png#pw)

к сведению

На запросы к реализованным методам, реализованное Merchant API возвращает ответы с ошибкой -32504: «Недостаточно привилегий для выполнения метода».

**Проверьте оплату неверной или недопустимой суммой**

В разделе «Неверные данные» нажмите на ссылку «Неверная сумма».

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_2.png#pw)

В параметрах теста укажите действительный номер заказа, неверную сумму и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_2.png#pw)

**Проверьте оплату несуществующего счёта**

В разделе «Неверные данные» нажмите на ссылку «Несуществующий счёт».

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_3.png#pw)

В параметрах теста укажите действительную сумму заказа, неверный номер заказа и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_3.png#pw)

**Проверьте возможность создания финансовой транзакции**

к сведению

Проверку возможности создания финансовой транзакции обеспечивает реализованный метод [CheckPerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/checkperformtransaction).

В разделе «Платежные запросы» нажмите на ссылку “CheckPerformTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_checkperformtransaction.png#pw)

Убедитесь что в парметрах теста присутствует значение парметра Account, сумма оплаты в тийинах и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_checkperformtransaction.png#pw)

На запрос к реализованному методу CheckPerformTransaction, реализованное Merchant API возвращает ответ без ошибок.

**Создайте транзакцию**

В разделе «Платежные запросы» нажмите на ссылку “CreateTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_createtransactionpng.png#pw)

Убедитесь что в параметрах запуска теста тип счета «Одноразовый», статус счета «Ожидает оплаты» и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_createtransaction.png#pw)

к сведению

Запросы по методам CreateTransaction, PerformTransaction, CancelTransaction посылаются два раза. В случае, если первый запрос даст сбой - второй обязательно пройдет. При повторных вызовах методов CreateTransaction, PerformTransaction, CancelTransaction ответ должен совпадать с ответом из первого запроса.

Реализованное Merchant API возвращает:

-   на запрос к реализованному методу [CheckPerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/checkperformtransaction) — ответ с результатом “allow”: true,;
    
-   на запрос к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) — ответ без ошибок;
    
-   на повторный запрос, к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) — ответ без ошибок;
    
-   на запрос к реализованному методу [CheckTransaction](https://developer.help.paycom.uz/metody-merchant-api/checktransaction) — ответ без ошибок;
    
-   на запрос к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) c новой транзакцией и состоянием счета «В ожидании оплаты» — ответ с ошибкой -31008: “Невозможно выполнить операцию”.
    

**Отмените неподтвержденную транзакцию**

В разделе «Платежные запросы» нажмите на ссылку “CancelTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_canceltransaction.png#pw)

Убедитесь что в параметрах запуска теста присутствует id транзакции, статус транзакции “1” (транзакция создана) и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_canceltransaction.png#pw)

##### Создание, подтверждение и отмена подтвержденной транзакции[​](https://developer.help.paycom.uz/pesochnitsa#%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D0%BD%D0%B8%D0%B5-%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5-%D0%B8-%D0%BE%D1%82%D0%BC%D0%B5%D0%BD%D0%B0-%D0%BF%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%BD%D0%BE%D0%B9-%D1%82%D1%80%D0%B0%D0%BD%D0%B7%D0%B0%D0%BA%D1%86%D0%B8%D0%B8 "Прямая ссылка на этот заголовок")

Войдите в магазин как покупатель. Добавьте товар в корзину и оплатите заказ с помощью Payme. После оплаты произойдет автоматический переход в «Песочницу» на страницу создания финансовой транзакции.

**Проверьте возможность создания финансовой транзакции**

к сведению

Проверку возможности создания финансовой транзакции обеспечивает реализованный метод [CheckPerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/checkperformtransaction).

В разделе «Платежные запросы» нажмите на ссылку “CheckPerformTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_checkperformtransaction.png#pw)

Убедитесь что в парметрах теста присутствует значение парметра Account, сумма оплаты в тийинах и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_checkperformtransaction.png#pw)

На запрос к реализованному методу CheckPerformTransaction, реализованное Merchant API возвращает ответ без ошибок.

**Создайте транзакцию**

В разделе «Платежные запросы» нажмите на ссылку “CreateTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_createtransactionpng.png#pw)

Убедитесь что в параметрах запуска теста тип счета «Одноразовый», статус счета «Ожидает оплаты» и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_createtransaction.png#pw)

Реализованное Merchant API возвращает:

-   на запрос к реализованному методу [CheckPerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/checkperformtransaction) — ответ с результатом “allow”: true,;
    
-   на запрос к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) — ответ без ошибок;
    
-   на повторный запрос, к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) — ответ без ошибок;
    
-   на запрос к реализованному методу [CheckTransaction](https://developer.help.paycom.uz/metody-merchant-api/checktransaction) — ответ без ошибок;
    
-   на запрос к реализованному методу [CreateTransaction](https://developer.help.paycom.uz/metody-merchant-api/createtransaction) c новой транзакцией и состоянием счета «В ожидании оплаты» — ответ с ошибкой -31008: “Невозможно выполнить операцию”.
    

**Подтвердите транзакцию**

В разделе «Платежные запросы» нажмите на ссылку “PerformTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_performtransaction.png#pw)

Убедитесь что в параметрах запуска теста присутствует id транзакции, статус транзакции “1” (создана) и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_performtransaction.png#pw)

Реализованное Merchant API возвращает ответ без ошибок:

-   на запрос к реализованному методу [PerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/performtransaction);
    
-   на повторный запрос, к реализованному методу [PerformTransaction](https://developer.help.paycom.uz/metody-merchant-api/performtransaction);
    
-   на запрос к реализованному методу [CheckTransaction](https://developer.help.paycom.uz/metody-merchant-api/checktransaction).
    

**Отмените подтвержденную транзакцию**

В разделе «Платежные запросы» нажмите на ссылку “CancelTransaction”.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/menu_canceltransaction.png#pw)

Убедитесь что в параметрах запуска теста присутствует id транзакции, статус транзакции “1” (транзакция создана) и запустите тест.

![](https://cdn.payme.uz/help/payme-business-help-developer/ru/sandbox/params_canceltransaction.png#pw)

---
Source: [Песочница | Payme Business](https://developer.help.paycom.uz/pesochnitsa)