import type { MinorUnitAmount } from '../payments/types/payment.types';

export interface UzumMerchantFieldValue {
  value: string;
}

export type UzumMerchantDataMap = Record<string, UzumMerchantFieldValue>;

export interface UzumMerchantCheckRequest {
  serviceId: number;
  timestamp: number;
  params: Record<string, unknown>;
}

export interface UzumMerchantCreateRequest extends UzumMerchantCheckRequest {
  transId: string;
  amount: MinorUnitAmount;
}

export interface UzumMerchantConfirmRequest {
  serviceId: number;
  timestamp: number;
  transId: string;
  paymentSource: string;
  tariff?: string | null;
  processingReferenceNumber?: string | null;
  phone: string;
  cardType?: 1 | 2;
}

export interface UzumMerchantReverseRequest {
  serviceId: number;
  timestamp: number;
  transId: string;
}

export interface UzumMerchantStatusRequest {
  serviceId: number;
  timestamp: number;
  transId: string;
}

export interface UzumMerchantCheckResponse {
  serviceId: number;
  timestamp: number;
  status: 'OK';
  data?: UzumMerchantDataMap;
}

export interface UzumMerchantCheckErrorResponse {
  serviceId?: number;
  timestamp?: number;
  status: 'FAILED';
  errorCode: string;
}

export interface UzumMerchantCreateResponse {
  serviceId: number;
  transId: string;
  status: 'CREATED';
  transTime: number;
  amount: MinorUnitAmount;
  data?: UzumMerchantDataMap;
}

export interface UzumMerchantCreateErrorResponse {
  serviceId?: number;
  transId?: string;
  status: 'FAILED';
  transTime?: number;
  errorCode: string;
}

export interface UzumMerchantConfirmResponse {
  serviceId: number;
  transId: string;
  status: 'CONFIRMED';
  confirmTime: number;
  amount: MinorUnitAmount;
  data?: UzumMerchantDataMap;
}

export interface UzumMerchantConfirmErrorResponse {
  serviceId?: number;
  transId?: string;
  status: 'FAILED';
  confirmTime?: number;
  errorCode: string;
}

export interface UzumMerchantReverseResponse {
  serviceId: number;
  transId: string;
  status: 'REVERSED';
  reverseTime: number;
  amount: MinorUnitAmount;
  data?: UzumMerchantDataMap;
}

export interface UzumMerchantReverseErrorResponse {
  serviceId?: number;
  transId?: string;
  status: 'FAILED';
  reverseTime?: number;
  errorCode: string;
}

export interface UzumMerchantStatusResponse {
  serviceId: number;
  transId: string;
  status: 'CREATED' | 'CONFIRMED' | 'REVERSED';
  transTime: number;
  confirmTime?: number | null;
  reverseTime?: number | null;
  amount?: MinorUnitAmount;
  data?: UzumMerchantDataMap;
}

export interface UzumMerchantStatusErrorResponse {
  serviceId?: number;
  transId?: string;
  status: 'FAILED';
  transTime?: number;
  confirmTime?: number | null;
  reverseTime?: number | null;
  errorCode: string;
}
