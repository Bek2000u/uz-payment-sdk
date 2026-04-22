import { PaymentResult } from '../types/payment.types';

export interface PaymentDriver {
  createPayment(data: any): Promise<PaymentResult>;
  checkPayment(data: any): Promise<PaymentResult>;
  cancelPayment?(data: any): Promise<PaymentResult>;
  generateInvoiceUrl?(data: any): string;
}
