import { PaymentSdkConfig } from '../config/payment-config.service';
import { WebhookService } from '../webhooks/webhook.service';
import { WebhookPayload } from '../webhooks/webhook.types';

export interface RequestHeadersLike {
  get(name: string): string | null;
}

export interface WebhookRequestLike {
  headers: RequestHeadersLike;
  text(): Promise<string>;
}

export interface ParseWebhookRequestOptions {
  provider: 'click' | 'payme';
  request: WebhookRequestLike;
  webhookService?: WebhookService;
  config?: PaymentSdkConfig;
}

export interface ProcessWebhookRequestOptions
  extends ParseWebhookRequestOptions {}

const getHeader = (
  headers: RequestHeadersLike,
  name: string,
): string | undefined => {
  const value = headers.get(name);
  return value === null ? undefined : value;
};

const parseUrlEncodedBody = (body: string): Record<string, string> => {
  const params = new URLSearchParams(body);
  return Object.fromEntries(params.entries());
};

export const readWebhookRequestBody = async (
  request: WebhookRequestLike,
): Promise<string> => {
  return request.text();
};

export const parseProviderWebhookRequest = async ({
  provider,
  request,
  webhookService,
  config,
}: ParseWebhookRequestOptions): Promise<WebhookPayload> => {
  const service = webhookService || new WebhookService(config);
  const rawBody = await readWebhookRequestBody(request);
  const contentType = getHeader(request.headers, 'content-type') || '';

  if (provider === 'click') {
    const payload = contentType.includes('application/x-www-form-urlencoded')
      ? parseUrlEncodedBody(rawBody)
      : (JSON.parse(rawBody) as Record<string, unknown>);

    return service.parseClickWebhook(payload as never);
  }

  const payload = JSON.parse(rawBody);
  const authorization = getHeader(request.headers, 'authorization');

  return service.parsePaymeWebhook(payload, authorization);
};

export const processProviderWebhookRequest = async (
  options: ProcessWebhookRequestOptions,
): Promise<WebhookPayload> => {
  const webhookService =
    options.webhookService || new WebhookService(options.config);
  const payload = await parseProviderWebhookRequest({
    ...options,
    webhookService,
  });

  await webhookService.processWebhook(payload);
  return payload;
};
