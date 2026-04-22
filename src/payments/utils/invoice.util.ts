import { Buffer } from 'buffer';

export interface GenerateInvoiceParams {
  amount: number;
  orderId: string;
  returnUrl: string;
}

export interface ClickGenerateInvoiceParams extends GenerateInvoiceParams {
  cardType?: string;
}

const PAYME_CHECKOUT_URL = 'https://checkout.paycom.uz/';
const PAYME_TEST_CHECKOUT_URL = 'https://test.paycom.uz/';
const CLICK_INVOICE_BASE_URL = 'https://my.click.uz/services/pay';

export const getPaymeCheckoutBaseUrl = (apiUrl?: string): string => {
  return apiUrl?.includes('test.paycom.uz')
    ? PAYME_TEST_CHECKOUT_URL
    : PAYME_CHECKOUT_URL;
};

export const generatePaymeInvoiceUrl = ({
  merchantId,
  amount,
  orderId,
  returnUrl,
  apiUrl,
}: GenerateInvoiceParams & {
  merchantId: string;
  apiUrl?: string;
}): string => {
  const params = `m=${merchantId};ac.order_id=${orderId};a=${amount};c=${returnUrl}`;
  return `${getPaymeCheckoutBaseUrl(apiUrl)}${Buffer.from(params).toString('base64')}`;
};

export const generateClickInvoiceUrl = ({
  merchantId,
  serviceId,
  amount,
  orderId,
  returnUrl,
  cardType,
}: ClickGenerateInvoiceParams & {
  merchantId: string;
  serviceId: string;
}): string => {
  const queryParams = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount: amount.toString(),
    transaction_param: orderId,
    return_url: returnUrl,
  });

  if (cardType) {
    queryParams.set('card_type', cardType);
  }

  return `${CLICK_INVOICE_BASE_URL}?${queryParams.toString()}`;
};
