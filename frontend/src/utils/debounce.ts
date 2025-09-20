/**
 * Creates a debounced version of a function that delays invoking until after
 * wait milliseconds have elapsed since the last time it was invoked.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) func(...args)
  }
}

/**
 * Creates a throttled version of a function that only invokes at most once per
 * every wait milliseconds.
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {},
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let previous = 0
  const { leading = true, trailing = true } = options

  return function executedFunction(...args: Parameters<T>) {
    const now = Date.now()

    if (!previous && !leading) previous = now

    const remaining = wait - (now - previous)

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func(...args)
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = !leading ? 0 : Date.now()
        timeout = null
        func(...args)
      }, remaining)
    }
  }
}

/**
 * Delays execution of a function until the next tick
 */
export function nextTick<T extends (...args: any[]) => any>(func: T): Promise<ReturnType<T>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(func())
    }, 0)
  })
}

/**
 * Creates a function that only executes once
 */
export function once<T extends (...args: any[]) => any>(
  func: T,
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false
  let result: ReturnType<T>

  return function executedFunction(...args: Parameters<T>) {
    if (!called) {
      called = true
      result = func(...args)
    }
    return result
  }
}

/**
 * Batches multiple function calls into a single execution
 */
export function batchify<T extends (...args: any[]) => any>(
  func: T,
  batchSize: number = 10,
): (...args: Parameters<T>) => void {
  const queue: Array<Parameters<T>> = []

  const processBatch = debounce(() => {
    const batch = queue.splice(0, batchSize)
    batch.forEach((args) => func(...args))

    if (queue.length > 0) {
      processBatch()
    }
  }, 0)

  return function batchedFunction(...args: Parameters<T>) {
    queue.push(args)
    processBatch()
  }
}

/**
 * Memoizes function results with optional cache size limit
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  maxCacheSize: number = 100,
): T & { cache: Map<string, ReturnType<T>>; clearCache: () => void } {
  const cache = new Map<string, ReturnType<T>>()

  const memoizedFunction = function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)

    // Implement LRU-like behavior
    if (cache.size >= maxCacheSize) {
      const firstKey = cache.keys().next().value
      if (firstKey !== undefined) {
        cache.delete(firstKey)
      }
    }

    cache.set(key, result)
    return result
  } as T & { cache: Map<string, ReturnType<T>>; clearCache: () => void }

  memoizedFunction.cache = cache
  memoizedFunction.clearCache = () => cache.clear()

  return memoizedFunction
}

/**
 * Retries a function with exponential backoff
 */
export function retry<T extends (...args: any[]) => Promise<any>>(
  func: T,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async function retryFunction(...args: Parameters<T>): Promise<ReturnType<T>> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await func(...args)
      } catch (error) {
        lastError = error as Error

        if (attempt === maxAttempts) {
          throw lastError
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError!
  }
}
