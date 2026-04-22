import {
  createWebhookServiceFromEnv,
  processProviderWebhookRequest,
} from 'uz-payment-sdk';
import { NextResponse } from 'next/server';

const webhooks = createWebhookServiceFromEnv({
  cacheStore: {
    async get() {
      return null;
    },
    async set() {},
    async setIfNotExists() {
      return true;
    },
    async del() {},
  },
});

export async function POST(request: Request) {
  const payload = await processProviderWebhookRequest({
    provider: 'payme',
    request,
    webhookService: webhooks,
  });

  return NextResponse.json({
    ok: true,
    provider: payload.provider,
    transactionId: payload.transactionId,
    status: payload.status,
  });
}
