// /src/lib/cache.js - Sistema de cache simple en memoria
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttl = new Map(); // Time to live
  }

  set(key, value, ttlMs = 300000) { // 5 minutos default
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, value);
    this.ttl.set(key, expiresAt);
  }

  get(key) {
    const expiresAt = this.ttl.get(key);
    if (!expiresAt || Date.now() > expiresAt) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }
    return this.cache.get(key);
  }

  invalidate(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.ttl.delete(key);
      }
    }
  }
}

export const forumCache = new MemoryCache();
