/**
 * Client-side caching utilities to reduce API calls
 * Implements memory caching with TTL (Time To Live) for frequently accessed data
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Clean up expired entries every 5 minutes
setInterval(() => memoryCache.cleanup(), 5 * 60 * 1000);

/**
 * Cache wrapper for API queries
 */
export function withCache<T>(
  cacheKey: string,
  queryFn: () => T | undefined,
  ttl?: number
): T | undefined {
  // Try to get from cache first
  const cached = memoryCache.get<T>(cacheKey);
  if (cached !== null) {
    return cached;
  }

  // Execute query
  const result = queryFn();
  
  // Cache the result if it's not undefined
  if (result !== undefined) {
    memoryCache.set(cacheKey, result, ttl);
  }

  return result;
}

/**
 * Cache configuration for different data types
 */
export const CACHE_CONFIG = {
  // Static content - cache for longer
  packages: 10 * 60 * 1000, // 10 minutes
  portfolio: 5 * 60 * 1000,  // 5 minutes
  gallery: 5 * 60 * 1000,    // 5 minutes
  clientLogos: 15 * 60 * 1000, // 15 minutes
  
  // Dynamic content - shorter cache
  bookings: 1 * 60 * 1000,   // 1 minute
  unavailableDates: 2 * 60 * 1000, // 2 minutes
  
  // User-specific - very short cache
  adminData: 30 * 1000,      // 30 seconds
} as const;

/**
 * Prefetch commonly used data to reduce API calls
 */
export async function prefetchCommonData() {
  // This would be called on app initialization
  // Implementation depends on your specific data access patterns
  console.log('Prefetching common data...');
}

/**
 * Invalidate cache for specific patterns
 */
export function invalidateCache(pattern: string) {
  const keys = Array.from(memoryCache['cache'].keys());
  const keysToDelete = keys.filter(key => key.includes(pattern));
  
  keysToDelete.forEach(key => memoryCache.delete(key));
  
  console.log(`Invalidated ${keysToDelete.length} cache entries matching: ${pattern}`);
}

/**
 * Browser-based persistent cache using localStorage
 */
export class PersistentCache {
  private prefix: string;
  
  constructor(prefix = 'ainan_cache_') {
    this.prefix = prefix;
  }

  set<T>(key: string, data: T, ttl = 60 * 60 * 1000): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }

  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();
      
      if (now - parsed.timestamp > parsed.ttl) {
        this.delete(key);
        return null;
      }

      return parsed.data as T;
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  delete(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.warn('Failed to delete from localStorage:', error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }
}

export const persistentCache = new PersistentCache();
