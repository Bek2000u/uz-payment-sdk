import type { PaymentResult } from '../types/payment.types';

export interface PaymentDriver<
  TCreateData,
  TCheckData,
  TCancelData = TCheckData,
  TInvoiceData = never,
  TResult extends PaymentResult = PaymentResult,
> {
  createPayment(data: TCreateData): Promise<TResult>;
  checkPayment(data: TCheckData): Promise<TResult>;
  cancelPayment?(data: TCancelData): Promise<TResult>;
  generateInvoiceUrl?(data: TInvoiceData): string;
}
