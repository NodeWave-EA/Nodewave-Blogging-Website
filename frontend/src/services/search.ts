import type { SearchResults } from '@/types'
import { apiService } from './api'

// Simple in-memory cache + in-flight dedupe for search endpoints to reduce API calls
type CacheEntry<T> = { expires: number; data: T }
const cache = new Map<string, CacheEntry<any>>()
const inFlight = new Map<string, Promise<any>>()

// Rate limiting state (client-side)
const callTimestamps = new Map<string, number[]>()
const banUntil = new Map<string, number>()

const now = () => Date.now()
const setCache = <T>(key: string, data: T, ttlMs: number) =>
  cache.set(key, { expires: now() + ttlMs, data })
const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null
  if (entry.expires < now()) {
    cache.delete(key)
    return null
  }
  return entry.data as T
}

const CACHE_TTL = {
  suggest: 30 * 1000, // 30s
  quick: 60 * 1000, // 60s
  search: 5 * 60 * 1000, // 5m
}

// Rate limit configuration per endpoint
const RATE_CONFIG: Record<string, { limit: number; windowMs: number }> = {
  suggest: { limit: 40, windowMs: 60_000 },
  quick: { limit: 40, windowMs: 60_000 },
  search: { limit: 100, windowMs: 60_000 },
}

const pruneTimestamps = (key: string, windowMs: number) => {
  const arr = callTimestamps.get(key) || []
  const cutoff = now() - windowMs
  const kept = arr.filter((t) => t >= cutoff)
  callTimestamps.set(key, kept)
  return kept
}

const allowRequest = (key: string) => {
  const cfg = RATE_CONFIG[key]
  if (!cfg) return true
  // If endpoint is banned due to server 429 or local limit, reject
  const b = banUntil.get(key) || 0
  if (b > now()) return false
  const arr = pruneTimestamps(key, cfg.windowMs)
  if (arr.length >= cfg.limit) {
    // locally enforce ban for one window to reduce spam
    banUntil.set(key, now() + cfg.windowMs)
    return false
  }
  // record call
  arr.push(now())
  callTimestamps.set(key, arr)
  return true
}

export const searchService = {
  // Full search endpoint for view-all / detailed search
  search: async (query: string, limit = 20, signal?: AbortSignal) => {
    // normalize key to avoid cache misses on case/whitespace
    const q = query.trim().toLowerCase()
    const key = `search:${q}:${limit}`
    if (!allowRequest('search')) {
      // Try to return cached result if available, otherwise return an empty search result
      const cached = getCache<SearchResults>(key)
      if (cached) return Promise.resolve(cached)
      return Promise.resolve({ query: q, results: [], total: 0, took: 0 })
    }
    const cached = getCache<SearchResults>(key)
    if (cached) return Promise.resolve(cached)
    if (inFlight.has(key)) return inFlight.get(key) as Promise<SearchResults>

    const p = apiService
      .get<SearchResults>('/search', {
        params: { q: query, limit },
        signal,
      })
      .then((res) => {
        setCache(key, res, CACHE_TTL.search)
        inFlight.delete(key)
        return res
      })
      .catch((err) => {
        inFlight.delete(key)
        // If server responds 429, set a short ban so we don't retry repeatedly
        if (err?.response?.status === 429) banUntil.set('search', now() + 60_000)
        throw err
      })

    inFlight.set(key, p)
    return p
  },

  // Suggest endpoint for typeahead (lighter-weight)
  suggest: async (query: string, limit = 8, signal?: AbortSignal) => {
    if (!query || query.trim().length < 3) return Promise.resolve({ suggestions: [] })
    const q = query.trim().toLowerCase()
    const key = `suggest:${q}:${limit}`
    if (!allowRequest('suggest')) {
      const cached = getCache<any>(key)
      if (cached) return Promise.resolve(cached)
      return Promise.resolve({ suggestions: [] })
    }
    const cached = getCache<any>(key)
    if (cached) return Promise.resolve(cached)
    if (inFlight.has(key)) return inFlight.get(key)

    const p = apiService
      .get<any>('/search/suggestions', {
        params: { q: query, limit },
        signal,
      })
      .then((res) => {
        setCache(key, res, CACHE_TTL.suggest)
        inFlight.delete(key)
        return res
      })
      .catch((err) => {
        inFlight.delete(key)
        if (err?.response?.status === 429) banUntil.set('suggest', now() + 60_000)
        throw err
      })

    inFlight.set(key, p)
    return p
  },

  // Quick search endpoint for type-filtered quick results
  quick: async (query: string, type?: string, limit = 10, signal?: AbortSignal) => {
    if (!query || query.trim().length < 3) return Promise.resolve({ data: [] })
    const q = query.trim().toLowerCase()
    const key = `quick:${type || 'all'}:${q}:${limit}`
    if (!allowRequest('quick')) {
      const cached = getCache<any>(key)
      if (cached) return Promise.resolve(cached)
      return Promise.resolve({ data: [] })
    }
    const cached = getCache<any>(key)
    if (cached) return Promise.resolve(cached)
    if (inFlight.has(key)) return inFlight.get(key)

    const p = apiService
      .get<any>('/search/quick', {
        params: { q: query, type, limit },
        signal,
      })
      .then((res) => {
        setCache(key, res, CACHE_TTL.quick)
        inFlight.delete(key)
        return res
      })
      .catch((err) => {
        inFlight.delete(key)
        if (err?.response?.status === 429) banUntil.set('quick', now() + 60_000)
        throw err
      })

    inFlight.set(key, p)
    return p
  },
}
