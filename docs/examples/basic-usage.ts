import { PaymentsService } from 'uz-payment-sdk';

const payments = new PaymentsService({
  providers: {
    payme: {
      merchantId: process.env.PAYME_MERCHANT_ID!,
      key: process.env.PAYME_KEY!,
      apiUrl: process.env.PAYME_API_URL!,
    },
    click: {
      serviceId: process.env.CLICK_SERVICE_ID!,
      merchantId: process.env.CLICK_MERCHANT_ID!,
      merchantUserId: process.env.CLICK_MERCHANT_USER_ID!,
      secretKey: process.env.CLICK_SECRET_KEY!,
      apiUrl: process.env.CLICK_API_URL!,
    },
    uzum: {
      terminalId: process.env.UZUM_TERMINAL_ID!,
      apiKey: process.env.UZUM_API_KEY!,
      apiUrl: process.env.UZUM_API_URL!,
      contentLanguage: process.env.UZUM_CONTENT_LANGUAGE || 'ru',
    },
  },
});

async function main() {
  const payment = await payments.create('click', {
    orderId: `order-${Date.now()}`,
    amount: 50000,
    phoneNumber: '998901234567',
    description: 'Test payment',
  });

  const hostedInvoiceUrl = payments.generateInvoiceUrl('payme', {
    orderId: 'order-123',
    amount: 50000,
    returnUrl: 'https://merchant.example/payments/return',
  });

  console.log('availableProviders', payments.getAvailableProviders());
  console.log('payment', payment);
  console.log('hostedInvoiceUrl', hostedInvoiceUrl);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
