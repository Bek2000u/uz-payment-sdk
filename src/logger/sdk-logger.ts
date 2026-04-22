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

const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'secret',
  'key',
  'apikey',
  'secretkey',
  'token',
  'accesstoken',
  'merchantaccesstoken',
  'authorization',
  'auth',
  'xauth',
  'cardnumber',
  'cvv',
  'pin',
  'pan',
  'signstring',
  'signature',
]);

const normalizeFieldName = (field: string): string =>
  field.toLowerCase().replace(/[^a-z0-9]/g, '');

const isSensitiveField = (field: string): boolean =>
  SENSITIVE_FIELD_NAMES.has(normalizeFieldName(field));

const maskRawValue = (value: unknown): string => {
  const raw = String(value);
  return '*'.repeat(Math.max(raw.length, 3));
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const maskRecursive = (
  value: unknown,
  seen: WeakSet<object>,
): unknown => {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((entry) => maskRecursive(entry, seen));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  if (seen.has(value)) {
    return '[Circular]';
  }

  seen.add(value);

  const masked: Record<string, unknown> = {};

  for (const [field, fieldValue] of Object.entries(value)) {
    if (isSensitiveField(field) && fieldValue !== undefined) {
      masked[field] = maskRawValue(fieldValue);
      continue;
    }

    masked[field] = maskRecursive(fieldValue, seen);
  }

  seen.delete(value);
  return masked;
};

export const maskSensitiveData = <T>(value: T): T => {
  return maskRecursive(value, new WeakSet<object>()) as T;
};
