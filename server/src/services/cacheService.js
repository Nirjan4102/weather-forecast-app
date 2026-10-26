import NodeCache from 'node-cache';
import { config } from '../config.js';

// Initialize cache with default TTL and periodic automatic eviction check
const cache = new NodeCache({
  stdTTL: config.cacheTtlSeconds,
  checkperiod: 120,
  useClones: false
});

/**
 * Get item from cache
 * @param {string} key
 * @returns {any | null}
 */
export const getCached = (key) => {
  return cache.get(key) || null;
};

/**
 * Save item into cache
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds]
 * @returns {boolean}
 */
export const setCached = (key, value, ttlSeconds = config.cacheTtlSeconds) => {
  return cache.set(key, value, ttlSeconds);
};

/**
 * Delete a specific key
 * @param {string} key
 */
export const deleteCached = (key) => {
  cache.del(key);
};

/**
 * Clear the entire cache
 */
export const flushCache = () => {
  cache.flushAll();
};

/**
 * Retrieve cache statistics
 */
export const getCacheStats = () => {
  return {
    keys: cache.keys().length,
    stats: cache.getStats(),
    defaultTtl: config.cacheTtlSeconds
  };
};

/**
 * Cache wrapper: returns cached value or executes fetcherFn and caches result
 */
export const getOrFetch = async (key, fetcherFn, ttlSeconds = config.cacheTtlSeconds) => {
  const cached = getCached(key);
  if (cached !== null) {
    return { data: cached, fromCache: true };
  }

  const freshData = await fetcherFn();
  setCached(key, freshData, ttlSeconds);
  return { data: freshData, fromCache: false };
};

export default cache;
