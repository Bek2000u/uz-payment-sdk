import {
  buildPaymentResult,
  normalizePaymentStatus,
} from '../payments/utils/normalizers.util';

describe('Normalized result contract', () => {
  it('keeps failed, cancelled and unknown states non-successful', () => {
    const failed = buildPaymentResult({
      provider: 'payme',
      transactionId: 't-1',
      status: 'failed',
    });
    const cancelled = buildPaymentResult({
      provider: 'click',
      transactionId: 't-2',
      status: 'cancelled',
    });
    const unknown = buildPaymentResult({
      provider: 'uzum',
      transactionId: 't-3',
      status: 'mystery-state',
    });

    expect(failed.success).toBe(false);
    expect(failed.isTerminal).toBe(true);
    expect(failed.isSettled).toBe(false);
    expect(failed.isFinalSuccess).toBe(false);
    expect(failed.requiresAction).toBe(false);

    expect(cancelled.success).toBe(false);
    expect(cancelled.isTerminal).toBe(true);

    expect(unknown.success).toBe(false);
    expect(unknown.isTerminal).toBe(false);
  });

  it('keeps pending and success states successful for ongoing or completed flows', () => {
    const pending = buildPaymentResult({
      provider: 'payme',
      transactionId: 't-4',
      status: 'registered',
    });
    const success = buildPaymentResult({
      provider: 'click',
      transactionId: 't-5',
      status: 4,
    });

    expect(pending.success).toBe(true);
    expect(pending.isTerminal).toBe(false);
    expect(pending.isSettled).toBe(false);
    expect(pending.isFinalSuccess).toBe(false);
    expect(pending.requiresAction).toBe(true);

    expect(success.success).toBe(true);
    expect(success.isTerminal).toBe(true);
    expect(success.isSettled).toBe(true);
    expect(success.isFinalSuccess).toBe(true);
    expect(success.requiresAction).toBe(false);
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
