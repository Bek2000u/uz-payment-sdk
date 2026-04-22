import axios, { Method, RawAxiosRequestHeaders } from 'axios';

const DEFAULT_TIMEOUT_MS = 15000;

const getTimeoutMs = (): number =>
  Number(process.env.PAYMENT_HTTP_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

const requestJson = async <TResponse>(
  method: Method,
  url: string,
  payload: Record<string, unknown> | undefined,
  headers: RawAxiosRequestHeaders,
  context: string,
): Promise<TResponse> => {
  try {
    const response = await axios.request<TResponse>({
      method,
      url,
      data: payload,
      headers,
      timeout: getTimeoutMs(),
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const providerMessage =
        error.response?.data && typeof error.response.data === 'object'
          ? JSON.stringify(error.response.data)
          : error.message;

      throw new Error(
        `${context} failed${status ? ` (${status})` : ''}: ${providerMessage}`,
      );
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`${context} failed: ${message}`);
  }
};

export const postJson = async <TResponse>(
  url: string,
  payload: Record<string, unknown>,
  headers: RawAxiosRequestHeaders,
  context: string,
): Promise<TResponse> => requestJson('POST', url, payload, headers, context);

export const getJson = async <TResponse>(
  url: string,
  headers: RawAxiosRequestHeaders,
  context: string,
): Promise<TResponse> => requestJson('GET', url, undefined, headers, context);

export const deleteJson = async <TResponse>(
  url: string,
  headers: RawAxiosRequestHeaders,
  context: string,
): Promise<TResponse> => requestJson('DELETE', url, undefined, headers, context);
