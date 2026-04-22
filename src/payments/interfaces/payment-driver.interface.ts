import type { PaymentResult } from '../types/payment.types';
import type { PaymentRequestOptions } from '../../transport/payment-transport';

export interface PaymentDriver<
  TCreateData,
  TCheckData,
  TCancelData = TCheckData,
  TInvoiceData = never,
  TResult extends PaymentResult = PaymentResult,
> {
  createPayment(data: TCreateData, requestOptions?: PaymentRequestOptions): Promise<TResult>;
  checkPayment(data: TCheckData, requestOptions?: PaymentRequestOptions): Promise<TResult>;
  cancelPayment?(data: TCancelData, requestOptions?: PaymentRequestOptions): Promise<TResult>;
  generateInvoiceUrl?(data: TInvoiceData): string;
}
