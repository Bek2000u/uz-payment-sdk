import { CacheStore, MemoryCacheStore } from '../cache/cache-store';
import { PaymentConfigurationError } from '../errors/PaymentSdkError';
import { SdkLogger, noopLogger } from '../logger/sdk-logger';
import { PaymentProviderId } from '../payments/types/payment.types';
import {
  PaymentRequestOptions,
  PaymentTransport,
} from '../transport/payment-transport';
import { createAxiosTransport } from '../payments/utils/http-client.util';

type ProviderCredentialMap = Record<PaymentProviderId, string[][]>;
type EnvSource = Record<string, string | undefined>;

export interface EnterpriseWebhookForwardingConfig {
  enabled: boolean;
  url?: string;
  secret?: string;
  timeoutMs: number;
  source: string;
  headerPrefix: string;
}

export interface PaymentConfig {
  payme: {
    merchantId: string;
    login?: string;
    key: string;
    apiUrl: string;
  };
  click: {
    serviceId: string;
    merchantId: string;
    merchantUserId?: string;
    secretKey: string;
    apiUrl: string;
  };
  uzum: {
    terminalId: string;
    apiKey: string;
    merchantAccessToken?: string;
    contentLanguage: string;
    apiUrl: string;
  };
}

export interface PaymentSdkConfig {
  providers?: Partial<PaymentConfig>;
  enterpriseWebhookForwarding?: Partial<EnterpriseWebhookForwardingConfig>;
  env?: EnvSource;
  logger?: SdkLogger;
  cacheStore?: CacheStore;
  webhookEventHistoryLimit?: number;
  allowInMemoryWebhookIdempotency?: boolean;
  transport?: PaymentTransport;
  requestDefaults?: PaymentRequestOptions;
}

export class PaymentConfigService {
  private readonly env: EnvSource;
  private readonly config: PaymentSdkConfig;
  readonly logger: SdkLogger;
  readonly cacheStore: CacheStore;
  readonly transport: PaymentTransport;

  constructor(config: PaymentSdkConfig = {}) {
    this.config = config;
    this.env = config.env || (process.env as EnvSource);
    this.logger = config.logger || noopLogger;
    this.cacheStore = config.cacheStore || new MemoryCacheStore();
    this.transport = config.transport || createAxiosTransport();
  }

  resolveRequestOptions(
    overrides: PaymentRequestOptions = {},
  ): PaymentRequestOptions {
    const defaultTimeoutMs = Number(
      this.env.PAYMENT_HTTP_TIMEOUT_MS || process.env.PAYMENT_HTTP_TIMEOUT_MS || 15000,
    );

    return {
      timeoutMs:
        overrides.timeoutMs ??
        this.config.requestDefaults?.timeoutMs ??
        defaultTimeoutMs,
      signal: overrides.signal ?? this.config.requestDefaults?.signal,
      retry: overrides.retry ?? this.config.requestDefaults?.retry,
    };
  }

  private readonly providerCredentialMap: ProviderCredentialMap = {
    payme: [['PAYME_MERCHANT_ID'], ['PAYME_KEY', 'PAYME_SECRET_KEY']],
    click: [
      ['CLICK_SERVICE_ID'],
      ['CLICK_SECRET_KEY'],
      ['CLICK_MERCHANT_USER_ID', 'CLICK_MERCHANT_ID'],
    ],
    uzum: [['UZUM_TERMINAL_ID'], ['UZUM_API_KEY']],
  };

  private getFirst(
    keys: string[],
    fallback?: string,
    explicit?: string,
  ): string | undefined {
    if (explicit) {
      return explicit;
    }

    for (const key of keys) {
      const value = this.env[key];
      if (value) {
        return value;
      }
    }

    return fallback;
  }

  get paymeConfig() {
    const provider = this.config.providers?.payme;
    return {
      merchantId: this.getFirst(
        ['PAYME_MERCHANT_ID', 'PAYME_CASHBOX_ID'],
        undefined,
        provider?.merchantId,
      ),
      login: this.getFirst(
        ['PAYME_LOGIN', 'PAYME_MERCHANT_ID', 'PAYME_CASHBOX_ID'],
        undefined,
        provider?.login,
      ),
      key: this.getFirst(
        ['PAYME_KEY', 'PAYME_SECRET_KEY'],
        undefined,
        provider?.key,
      ),
      apiUrl: this.getFirst(
        ['PAYME_API_URL', 'PAYME_ENDPOINT'],
        'https://checkout.test.paycom.uz/api',
        provider?.apiUrl,
      ),
    };
  }

  get clickConfig() {
    const provider = this.config.providers?.click;
    return {
      serviceId: this.getFirst(['CLICK_SERVICE_ID'], undefined, provider?.serviceId),
      merchantId: this.getFirst(
        ['CLICK_MERCHANT_ID'],
        undefined,
        provider?.merchantId,
      ),
      merchantUserId: this.getFirst(
        ['CLICK_MERCHANT_USER_ID', 'CLICK_MERCHANT_ID'],
        undefined,
        provider?.merchantUserId,
      ),
      secretKey: this.getFirst(
        ['CLICK_SECRET_KEY'],
        undefined,
        provider?.secretKey,
      ),
      apiUrl: this.getFirst(
        ['CLICK_API_URL'],
        'https://api.click.uz/v2/merchant',
        provider?.apiUrl,
      ),
    };
  }

  get uzumConfig() {
    const provider = this.config.providers?.uzum;
    return {
      terminalId: this.getFirst(
        ['UZUM_TERMINAL_ID'],
        undefined,
        provider?.terminalId,
      ),
      apiKey: this.getFirst(['UZUM_API_KEY'], undefined, provider?.apiKey),
      merchantAccessToken: this.getFirst(
        ['UZUM_MERCHANT_ACCESS_TOKEN'],
        undefined,
        provider?.merchantAccessToken,
      ),
      contentLanguage: this.getFirst(
        ['UZUM_CONTENT_LANGUAGE'],
        'ru',
        provider?.contentLanguage,
      ),
      apiUrl: this.getFirst(
        ['UZUM_API_URL'],
        'https://developer.uzumbank.uz',
        provider?.apiUrl,
      ),
    };
  }

  get enterpriseWebhookForwardingConfig(): EnterpriseWebhookForwardingConfig {
    const explicit = this.config.enterpriseWebhookForwarding;
    const url = this.getFirst(
      ['ENTERPRISE_WEBHOOK_URL', 'PAYMENT_WEBHOOK_FORWARD_URL'],
      undefined,
      explicit?.url,
    );

    return {
      enabled: explicit?.enabled ?? Boolean(url),
      url,
      secret: this.getFirst(
        ['ENTERPRISE_WEBHOOK_SECRET', 'PAYMENT_WEBHOOK_FORWARD_SECRET'],
        undefined,
        explicit?.secret,
      ),
      timeoutMs: Number(
        this.getFirst(
          ['ENTERPRISE_WEBHOOK_TIMEOUT_MS', 'PAYMENT_WEBHOOK_FORWARD_TIMEOUT_MS'],
          String(explicit?.timeoutMs || 5000),
        ),
      ),
      source: this.getFirst(
        ['ENTERPRISE_WEBHOOK_SOURCE', 'PAYMENT_WEBHOOK_FORWARD_SOURCE'],
        'payment-sdk',
        explicit?.source,
      )!,
      headerPrefix: this.getFirst(
        [
          'ENTERPRISE_WEBHOOK_HEADER_PREFIX',
          'PAYMENT_WEBHOOK_FORWARD_HEADER_PREFIX',
        ],
        'X-Payment-SDK',
        explicit?.headerPrefix,
      )!,
    };
  }

  getMissingProviderCredentials(provider: PaymentProviderId): string[] {
    const aliases = this.providerCredentialMap[provider] || [];

    return aliases
      .filter((keys) => !this.getFirst(keys, undefined, this.getExplicitProviderValue(provider, keys[0])))
      .map((keys) => keys[0]);
  }

  private getExplicitProviderValue(
    provider: PaymentProviderId,
    field: string,
  ): string | undefined {
    const explicit = this.config.providers?.[provider] as Record<string, string | undefined> | undefined;
    if (!explicit) {
      return undefined;
    }

    const fieldMap: Record<string, string> = {
      PAYME_MERCHANT_ID: 'merchantId',
      PAYME_CASHBOX_ID: 'merchantId',
      PAYME_LOGIN: 'login',
      PAYME_KEY: 'key',
      PAYME_SECRET_KEY: 'key',
      CLICK_SERVICE_ID: 'serviceId',
      CLICK_MERCHANT_ID: 'merchantId',
      CLICK_MERCHANT_USER_ID: 'merchantUserId',
      CLICK_SECRET_KEY: 'secretKey',
      UZUM_TERMINAL_ID: 'terminalId',
      UZUM_API_KEY: 'apiKey',
    };

    const mappedField = fieldMap[field];
    return mappedField ? explicit[mappedField] : undefined;
  }

  assertProviderCredentials(provider: PaymentProviderId): void {
    const missing = this.getMissingProviderCredentials(provider);
    if (missing.length > 0) {
      throw new PaymentConfigurationError(
        `Missing required ${provider} credentials: ${missing.join(', ')}`,
        {
          provider,
        },
      );
    }
  }
}
