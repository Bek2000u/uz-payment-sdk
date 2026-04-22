export interface SdkLogger {
  debug?(message: string, meta?: Record<string, unknown>): void;
  info?(message: string, meta?: Record<string, unknown>): void;
  warn?(message: string, meta?: Record<string, unknown>): void;
  error?(message: string, meta?: Record<string, unknown>): void;
}

export const noopLogger: SdkLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

export const maskSensitiveData = <T>(value: T): T => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  const sensitiveFields = new Set([
    'password',
    'secret',
    'key',
    'token',
    'cardNumber',
    'cvv',
    'pin',
    'authorization',
  ]);

  const cloned = { ...(value as Record<string, unknown>) };

  for (const field of Object.keys(cloned)) {
    if (sensitiveFields.has(field) && cloned[field] !== undefined) {
      const raw = String(cloned[field]);
      cloned[field] = '*'.repeat(raw.length);
    }
  }

  return cloned as T;
};
