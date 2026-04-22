import {
  buildPaymentResult,
  normalizePaymentStatus,
} from '../payments/utils/normalizers.util';

describe('Normalized result contract', () => {
  it('keeps failed, cancelled and unknown states non-successful', () => {
    expect(
      buildPaymentResult({
        provider: 'payme',
        transactionId: 't-1',
        status: 'failed',
      }).success,
    ).toBe(false);

    expect(
      buildPaymentResult({
        provider: 'click',
        transactionId: 't-2',
        status: 'cancelled',
      }).success,
    ).toBe(false);

    expect(
      buildPaymentResult({
        provider: 'uzum',
        transactionId: 't-3',
        status: 'mystery-state',
      }).success,
    ).toBe(false);
  });

  it('keeps pending and success states successful for ongoing or completed flows', () => {
    expect(
      buildPaymentResult({
        provider: 'payme',
        transactionId: 't-4',
        status: 'registered',
      }).success,
    ).toBe(true);

    expect(
      buildPaymentResult({
        provider: 'click',
        transactionId: 't-5',
        status: 4,
      }).success,
    ).toBe(true);
  });

  it('normalizes representative provider statuses from official docs', () => {
    expect(normalizePaymentStatus(4)).toBe('success');
    expect(normalizePaymentStatus(0)).toBe('pending');
    expect(normalizePaymentStatus('REGISTERED')).toBe('pending');
    expect(normalizePaymentStatus('IN_PROGRESS')).toBe('processing');
    expect(normalizePaymentStatus('REVERSED')).toBe('cancelled');
    expect(normalizePaymentStatus('FAIL')).toBe('failed');
  });
});
