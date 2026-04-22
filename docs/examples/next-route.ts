import { PaymentsService } from 'uz-payment-sdk';
import { NextResponse } from 'next/server';

const payments = new PaymentsService({
  providers: {
    click: {
      serviceId: process.env.CLICK_SERVICE_ID!,
      merchantId: process.env.CLICK_MERCHANT_ID!,
      merchantUserId: process.env.CLICK_MERCHANT_USER_ID!,
      secretKey: process.env.CLICK_SECRET_KEY!,
      apiUrl: process.env.CLICK_API_URL!,
    },
  },
});

export async function POST(request: Request) {
  const body = await request.json();

  const payment = await payments.create('click', {
    orderId: body.orderId,
    amount: body.amount,
    phoneNumber: body.phoneNumber,
    description: body.description,
  });

  return NextResponse.json(payment);
}
