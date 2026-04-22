import * as crypto from 'crypto';

export function generateBasicAuthHeader(
  merchantId: string,
  key: string,
): string {
  const token = Buffer.from(`${merchantId}:${key}`).toString('base64');
  return `Basic ${token}`;
}

export function generatePaymeXAuthHeader(
  merchantId: string,
  key: string,
): string {
  return `${merchantId}:${key}`;
}

export function generateClickMerchantAuthHeader(
  merchantUserId: string,
  secretKey: string,
  timestampSec: number,
): string {
  const digest = crypto
    .createHash('sha1')
    .update(`${timestampSec}${secretKey}`)
    .digest('hex');

  return `${merchantUserId}:${digest}:${timestampSec}`;
}
