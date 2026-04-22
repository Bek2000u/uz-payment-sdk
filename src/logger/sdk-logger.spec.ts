import { maskSensitiveData } from './sdk-logger';

describe('maskSensitiveData', () => {
  it('masks nested sensitive fields recursively', () => {
    const masked = maskSensitiveData({
      authorization: 'Bearer top-level-token',
      provider: {
        apiKey: 'secret-api-key',
        nested: {
          token: 'token-1',
          sign_string: 'signature-1',
        },
      },
      cards: [
        {
          cardNumber: '8600123412341234',
          cvv: '123',
        },
      ],
    });

    expect(masked).toEqual({
      authorization: '**********************',
      provider: {
        apiKey: '**************',
        nested: {
          token: '*******',
          sign_string: '***********',
        },
      },
      cards: [
        {
          cardNumber: '****************',
          cvv: '***',
        },
      ],
    });
  });

  it('handles circular references safely', () => {
    const payload: Record<string, unknown> = {
      token: 'secret-token',
    };
    payload.self = payload;

    const masked = maskSensitiveData(payload) as Record<string, unknown>;

    expect(masked.token).toBe('************');
    expect(masked.self).toBe('[Circular]');
  });
});
