export interface CacheStore {
  get?<T>(key: string): Promise<T | null>;
  set?(key: string, value: unknown, ttl?: number): Promise<void>;
  setIfNotExists?(
    key: string,
    value: unknown,
    ttl?: number,
  ): Promise<boolean>;
  del?(key: string): Promise<void>;
}

interface CacheEntry {
  expiresAt: number;
  value: unknown;
}

export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set(key: string, value: unknown, ttl = 300): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  async setIfNotExists(
    key: string,
    value: unknown,
    ttl = 300,
  ): Promise<boolean> {
    const existing = await this.get(key);
    if (existing !== null) {
      return false;
    }

    await this.set(key, value, ttl);
    return true;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}
