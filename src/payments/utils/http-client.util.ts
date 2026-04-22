import axios, {
  AxiosError,
  Method,
  RawAxiosRequestHeaders,
} from 'axios';
import { PaymentTransportError } from '../../errors/PaymentSdkError';
import {
  PaymentRequestOptions,
  PaymentRetryPolicy,
  PaymentTransport,
  PaymentTransportRequest,
} from '../../transport/payment-transport';

const DEFAULT_TIMEOUT_MS = 15000;
const DEFAULT_RETRYABLE_STATUS_CODES = [408, 425, 429, 500, 502, 503, 504];

const normalizeRetryPolicy = (
  retry: PaymentRequestOptions['retry'],
): Required<PaymentRetryPolicy> => {
  if (typeof retry === 'number') {
    return {
      attempts: retry,
      baseDelayMs: 250,
      maxDelayMs: 2000,
      retryableStatusCodes: DEFAULT_RETRYABLE_STATUS_CODES,
    };
  }

  return {
    attempts: retry?.attempts ?? 0,
    baseDelayMs: retry?.baseDelayMs ?? 250,
    maxDelayMs: retry?.maxDelayMs ?? 2000,
    retryableStatusCodes:
      retry?.retryableStatusCodes ?? DEFAULT_RETRYABLE_STATUS_CODES,
  };
};

const sleep = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const createDelay = (
  attempt: number,
  retryPolicy: Required<PaymentRetryPolicy>,
): number => {
  const exponentialDelay = retryPolicy.baseDelayMs * 2 ** attempt;
  return Math.min(exponentialDelay, retryPolicy.maxDelayMs);
};

const withTimeoutSignal = (
  timeoutMs: number | undefined,
  signal?: AbortSignal,
): { signal?: AbortSignal; cleanup(): void } => {
  if (!timeoutMs && !signal) {
    return { signal: undefined, cleanup() {} };
  }

  const controller = new AbortController();
  let timeoutId: NodeJS.Timeout | undefined;

  const abort = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      controller.abort();
    } else {
      signal.addEventListener('abort', abort, { once: true });
    }
  }

  if (timeoutMs) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  return {
    signal: controller.signal,
    cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (signal) {
        signal.removeEventListener('abort', abort);
      }
    },
  };
};

const parseHeaders = (headers: Headers): Record<string, string> => {
  const parsed: Record<string, string> = {};
  headers.forEach((value, key) => {
    parsed[key] = value;
  });
  return parsed;
};

const createTransportError = (
  request: PaymentTransportRequest,
  error: unknown,
  httpStatus?: number,
  providerMessage?: string,
): PaymentTransportError => {
  const message =
    providerMessage ||
    (error instanceof Error ? error.message : 'Unknown transport error');
  const isTimeout =
    error instanceof Error &&
    (error.name === 'AbortError' ||
      error.message.toLowerCase().includes('timeout'));
  const retryable =
    isTimeout ||
    (httpStatus !== undefined && DEFAULT_RETRYABLE_STATUS_CODES.includes(httpStatus));

  return new PaymentTransportError(
    `${request.context} failed${httpStatus ? ` (${httpStatus})` : ''}: ${message}`,
    {
      code: httpStatus ?? (isTimeout ? 'timeout' : 'transport_error'),
      provider: request.provider || 'sdk',
      httpStatus,
      retryable,
      category: isTimeout ? 'timeout' : 'network',
      details: {
        url: request.url,
        method: request.method,
      },
      cause: error,
    },
  );
};

const executeWithRetry = async <TResponse>(
  request: PaymentTransportRequest,
  executor: () => Promise<TResponse>,
): Promise<TResponse> => {
  const retryPolicy = normalizeRetryPolicy(request.retry);
  let attempt = 0;

  while (true) {
    try {
      return await executor();
    } catch (error) {
      if (
        !(error instanceof PaymentTransportError) ||
        !error.retryable ||
        attempt >= retryPolicy.attempts
      ) {
        throw error;
      }

      await sleep(createDelay(attempt, retryPolicy));
      attempt += 1;
    }
  }
};

export const createAxiosTransport = (): PaymentTransport => ({
  async request<TResponse>(
    request: PaymentTransportRequest,
  ) {
    return executeWithRetry(request, async () => {
      try {
        const response = await axios.request<TResponse>({
          method: request.method as Method,
          url: request.url,
          data: request.body,
          headers: request.headers as RawAxiosRequestHeaders,
          timeout: request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
          signal: request.signal,
        });

        return {
          data: response.data,
          status: response.status,
          headers: (response.headers || {}) as Record<string, string>,
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          const status = axiosError.response?.status;
          const providerMessage =
            axiosError.response?.data &&
            typeof axiosError.response.data === 'object'
              ? JSON.stringify(axiosError.response.data)
              : axiosError.message;

          throw createTransportError(
            request,
            error,
            status,
            providerMessage,
          );
        }

        throw createTransportError(request, error);
      }
    });
  },
});

export const createFetchTransport = (
  fetchImpl: typeof fetch = fetch,
): PaymentTransport => ({
  async request<TResponse>(
    request: PaymentTransportRequest,
  ) {
    return executeWithRetry(request, async () => {
      const { signal, cleanup } = withTimeoutSignal(
        request.timeoutMs ?? DEFAULT_TIMEOUT_MS,
        request.signal,
      );

      try {
        const response = await fetchImpl(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body ? JSON.stringify(request.body) : undefined,
          signal,
        });

        const rawText = await response.text();
        const data = rawText
          ? (JSON.parse(rawText) as TResponse)
          : (undefined as TResponse);

        if (!response.ok) {
          throw createTransportError(
            request,
            new Error(response.statusText || 'Fetch transport error'),
            response.status,
            rawText || response.statusText,
          );
        }

        return {
          data,
          status: response.status,
          headers: parseHeaders(response.headers),
        };
      } catch (error) {
        if (error instanceof PaymentTransportError) {
          throw error;
        }

        throw createTransportError(request, error);
      } finally {
        cleanup();
      }
    });
  },
});

const requestJson = async <TResponse>(
  transport: PaymentTransport,
  method: Method,
  url: string,
  payload: Record<string, unknown> | undefined,
  headers: RawAxiosRequestHeaders,
  context: string,
  requestOptions: PaymentRequestOptions = {},
  provider: PaymentTransportRequest['provider'] = 'sdk',
): Promise<TResponse> => {
  const response = await transport.request<TResponse>({
    method,
    url,
    body: payload,
    headers: headers as Record<string, string>,
    context,
    provider,
    ...requestOptions,
  });

  return response.data;
};

export const postJson = async <TResponse>(
  transport: PaymentTransport,
  url: string,
  payload: Record<string, unknown>,
  headers: RawAxiosRequestHeaders,
  context: string,
  requestOptions: PaymentRequestOptions = {},
  provider: PaymentTransportRequest['provider'] = 'sdk',
): Promise<TResponse> =>
  requestJson(
    transport,
    'POST',
    url,
    payload,
    headers,
    context,
    requestOptions,
    provider,
  );

export const getJson = async <TResponse>(
  transport: PaymentTransport,
  url: string,
  headers: RawAxiosRequestHeaders,
  context: string,
  requestOptions: PaymentRequestOptions = {},
  provider: PaymentTransportRequest['provider'] = 'sdk',
): Promise<TResponse> =>
  requestJson(
    transport,
    'GET',
    url,
    undefined,
    headers,
    context,
    requestOptions,
    provider,
  );

export const deleteJson = async <TResponse>(
  transport: PaymentTransport,
  url: string,
  headers: RawAxiosRequestHeaders,
  context: string,
  requestOptions: PaymentRequestOptions = {},
  provider: PaymentTransportRequest['provider'] = 'sdk',
): Promise<TResponse> =>
  requestJson(
    transport,
    'DELETE',
    url,
    undefined,
    headers,
    context,
    requestOptions,
    provider,
  );
