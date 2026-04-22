import { generateBasicAuthHeader } from '../payments/utils/signer.util';
import {
  UzumMerchantCheckErrorResponse,
  UzumMerchantCheckRequest,
  UzumMerchantCheckResponse,
  UzumMerchantConfirmErrorResponse,
  UzumMerchantConfirmRequest,
  UzumMerchantConfirmResponse,
  UzumMerchantCreateErrorResponse,
  UzumMerchantCreateRequest,
  UzumMerchantCreateResponse,
  UzumMerchantDataMap,
  UzumMerchantReverseErrorResponse,
  UzumMerchantReverseRequest,
  UzumMerchantReverseResponse,
  UzumMerchantStatusErrorResponse,
  UzumMerchantStatusRequest,
  UzumMerchantStatusResponse,
} from './uzum-merchant.types';

export interface UzumMerchantAuthConfig {
  login: string;
  password: string;
}

const nowMs = () => Date.now();

export const createUzumMerchantAuthorizationHeader = (
  config: UzumMerchantAuthConfig,
): string => generateBasicAuthHeader(config.login, config.password);

export const validateUzumMerchantAuthorization = (
  authorization: string | undefined,
  config: UzumMerchantAuthConfig,
): boolean => {
  if (!authorization) {
    return false;
  }

  return authorization === createUzumMerchantAuthorizationHeader(config);
};

export const createUzumMerchantCheckResponse = (
  request: UzumMerchantCheckRequest,
  data?: UzumMerchantDataMap,
): UzumMerchantCheckResponse => ({
  serviceId: request.serviceId,
  timestamp: nowMs(),
  status: 'OK',
  ...(data ? { data } : {}),
});

export const createUzumMerchantCheckErrorResponse = (
  request: Partial<UzumMerchantCheckRequest>,
  errorCode: string,
): UzumMerchantCheckErrorResponse => ({
  serviceId: request.serviceId,
  timestamp: nowMs(),
  status: 'FAILED',
  errorCode,
});

export const createUzumMerchantCreateResponse = (
  request: UzumMerchantCreateRequest,
  data?: UzumMerchantDataMap,
): UzumMerchantCreateResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'CREATED',
  transTime: nowMs(),
  amount: request.amount,
  ...(data ? { data } : {}),
});

export const createUzumMerchantCreateErrorResponse = (
  request: Partial<UzumMerchantCreateRequest>,
  errorCode: string,
): UzumMerchantCreateErrorResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'FAILED',
  transTime: nowMs(),
  errorCode,
});

export const createUzumMerchantConfirmResponse = (
  request: UzumMerchantConfirmRequest,
  amount: number,
  data?: UzumMerchantDataMap,
): UzumMerchantConfirmResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'CONFIRMED',
  confirmTime: nowMs(),
  amount,
  ...(data ? { data } : {}),
});

export const createUzumMerchantConfirmErrorResponse = (
  request: Partial<UzumMerchantConfirmRequest>,
  errorCode: string,
): UzumMerchantConfirmErrorResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'FAILED',
  confirmTime: nowMs(),
  errorCode,
});

export const createUzumMerchantReverseResponse = (
  request: UzumMerchantReverseRequest,
  amount: number,
  data?: UzumMerchantDataMap,
): UzumMerchantReverseResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'REVERSED',
  reverseTime: nowMs(),
  amount,
  ...(data ? { data } : {}),
});

export const createUzumMerchantReverseErrorResponse = (
  request: Partial<UzumMerchantReverseRequest>,
  errorCode: string,
): UzumMerchantReverseErrorResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'FAILED',
  reverseTime: nowMs(),
  errorCode,
});

export const createUzumMerchantStatusResponse = (
  request: UzumMerchantStatusRequest,
  status: UzumMerchantStatusResponse['status'],
  transTime: number,
  options: {
    amount?: number;
    confirmTime?: number | null;
    reverseTime?: number | null;
    data?: UzumMerchantDataMap;
  } = {},
): UzumMerchantStatusResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status,
  transTime,
  ...(options.amount !== undefined ? { amount: options.amount } : {}),
  ...(options.confirmTime !== undefined ? { confirmTime: options.confirmTime } : {}),
  ...(options.reverseTime !== undefined ? { reverseTime: options.reverseTime } : {}),
  ...(options.data ? { data: options.data } : {}),
});

export const createUzumMerchantStatusErrorResponse = (
  request: Partial<UzumMerchantStatusRequest>,
  errorCode: string,
  options: {
    transTime?: number;
    confirmTime?: number | null;
    reverseTime?: number | null;
  } = {},
): UzumMerchantStatusErrorResponse => ({
  serviceId: request.serviceId,
  transId: request.transId,
  status: 'FAILED',
  transTime: options.transTime,
  ...(options.confirmTime !== undefined ? { confirmTime: options.confirmTime } : {}),
  ...(options.reverseTime !== undefined ? { reverseTime: options.reverseTime } : {}),
  errorCode,
});
