/**
 * Formatting utilities for dates, text, numbers, etc.
 */

/**
 * Format date to readable string
 */
export function formatDate(
  date: unknown,
  options?: {
    format?: 'full' | 'short' | 'medium' | 'long' | 'relative'
    locale?: string
  },
): string {
  const { format = 'medium', locale = 'en-US' } = options || {}
  const dateObj = resolveToDate(date)

  if (!dateObj) return 'Invalid date'

  switch (format) {
    case 'full':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

    case 'short':
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })

    case 'medium':
      return dateObj.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

    case 'long':
      return dateObj.toLocaleDateString(locale, {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

    case 'relative':
      return formatRelativeTime(dateObj)

    default:
      return dateObj.toLocaleDateString(locale)
  }
}

/**
 * Format date and time to readable string
 */
export function formatDateTime(
  date: unknown,
  options?: {
    format?: 'full' | 'short' | 'medium'
    locale?: string
  },
): string {
  const { format = 'medium', locale = 'en-US' } = options || {}
  const dateObj = resolveToDate(date)
  if (!dateObj) return 'Invalid date'

  switch (format) {
    case 'full':
      return dateObj.toLocaleString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

    case 'short':
      return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

    case 'medium':
    default:
      return dateObj.toLocaleString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
  }
}

/**
 * Format relative time (e.g., "2 days ago", "in 3 hours")
 */
export function formatRelativeTime(date: unknown): string {
  const dateObj = resolveToDate(date)
  if (!dateObj) return 'just now'
  const now = new Date()
  const diffInMs = now.getTime() - dateObj.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (Math.abs(diffInSeconds) < 60) {
    return 'just now'
  } else if (Math.abs(diffInMinutes) < 60) {
    return diffInMinutes > 0
      ? `${diffInMinutes} minutes ago`
      : `in ${Math.abs(diffInMinutes)} minutes`
  } else if (Math.abs(diffInHours) < 24) {
    return diffInHours > 0 ? `${diffInHours} hours ago` : `in ${Math.abs(diffInHours)} hours`
  } else if (Math.abs(diffInDays) < 7) {
    return diffInDays > 0 ? `${diffInDays} days ago` : `in ${Math.abs(diffInDays)} days`
  } else if (Math.abs(diffInWeeks) < 4) {
    return diffInWeeks > 0 ? `${diffInWeeks} weeks ago` : `in ${Math.abs(diffInWeeks)} weeks`
  } else if (Math.abs(diffInMonths) < 12) {
    return diffInMonths > 0 ? `${diffInMonths} months ago` : `in ${Math.abs(diffInMonths)} months`
  } else {
    return diffInYears > 0 ? `${diffInYears} years ago` : `in ${Math.abs(diffInYears)} years`
  }
}

/**
 * Format distance to now (alias for formatRelativeTime with options)
 */
export function formatDistanceToNow(date: unknown, options?: { addSuffix?: boolean }): string {
  const { addSuffix = false } = options || {}
  const result = formatRelativeTime(date)

  if (!addSuffix) {
    // Remove "ago" and "in" prefixes/suffixes for cleaner display
    return result.replace(' ago', '').replace('in ', '').replace('just now', 'now')
  }

  return result
}

/**
 * Format reading time from text content
 */
export function calculateReadingTime(
  content: string,
  wordsPerMinute = 200,
): {
  minutes: number
  text: string
} {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.ceil(words / wordsPerMinute)

  return {
    minutes,
    text: `${minutes} min read`,
  }
}

/**
 * Format number with thousands separator
 */
export function formatNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(num)
}

/**
 * Format number to compact form (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num)
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number, ellipsis = '...'): string {
  if (text.length <= maxLength) {
    return text
  }

  return text.slice(0, maxLength - ellipsis.length).trim() + ellipsis
}

/**
 * Truncate text by words
 */
export function truncateWords(text: string, maxWords: number, ellipsis = '...'): string {
  const words = text.trim().split(/\s+/)

  if (words.length <= maxWords) {
    return text
  }

  return words.slice(0, maxWords).join(' ') + ellipsis
}

/**
 * Extract plain text from HTML
 */
export function stripHtml(html: string): string {
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Fallback for server-side
  return html.replace(/<[^>]*>/g, '')
}

/**
 * Create excerpt from content
 */
export function createExcerpt(content: string, maxLength = 160, preserveWords = true): string {
  const plainText = stripHtml(content)

  if (preserveWords) {
    return truncateWords(plainText, Math.ceil(maxLength / 6)) // Rough estimate of words
  }

  return truncateText(plainText, maxLength)
}

/**
 * Slugify text (convert to URL-friendly format)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Convert slug back to readable title
 */
export function unslugify(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Get image URL with Strapi base URL if needed
 */
export function getImageUrl(imageUrl: string, baseUrl?: string): string {
  if (!imageUrl) return ''

  // If already absolute URL, return as is
  if (imageUrl.startsWith('http')) {
    return imageUrl
  }

  // Use provided base URL or default from env
  const base = baseUrl || import.meta.env.VITE_API_URL?.replace('/api', '')
  return `${base}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  if (bytes === 0) return '0 Bytes'

  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)

  return `${size.toFixed(2)} ${sizes[i]}`
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Generate color from string (for avatars, badges, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Generate random ID
 */
export function generateId(length = 8): string {
  return Math.random()
    .toString(36)
    .substring(2, 2 + length)
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  func: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T
  }

  if (typeof obj === 'object') {
    const clonedObj = {} as T
    Object.keys(obj).forEach((key) => {
      clonedObj[key as keyof T] = deepClone(obj[key as keyof T])
    })
    return clonedObj
  }

  return obj
}

/**
 * Resolve a variety of possible date representations into a Date instance.
 * Supports:
 * - JS Date objects
 * - ISO date strings
 * - numeric timestamps
 * - nested Strapi shapes like { data: { attributes: { publishedAt: '...' }}}
 * - objects containing common keys: publishedAt, published_at, createdAt, created_at, updatedAt, updated_at
 */
function resolveToDate(input: unknown): Date | null {
  if (!input && input !== 0) return null
  if (input instanceof Date) return input

  if (typeof input === 'number') {
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }

  if (typeof input === 'string') {
    const d = new Date(input)
    return isNaN(d.getTime()) ? null : d
  }

  if (typeof input === 'object' && input !== null) {
    const obj = input as Record<string, unknown>

    // Unwrap common Strapi shapes
    if (obj.data) return resolveToDate((obj.data as any).attributes ?? obj.data)
    if (obj.attributes) return resolveToDate((obj.attributes as any).publishedAt ?? obj.attributes)

    // Known date-like keys
    const keys = [
      'publishedAt',
      'published_at',
      'createdAt',
      'created_at',
      'updatedAt',
      'updated_at',
      'date',
    ]

    for (const k of keys) {
      if (k in obj && obj[k] !== undefined && obj[k] !== null) {
        return resolveToDate(obj[k])
      }
    }
  }

  return null
}

/**
 * Resolve input to an ISO date string if possible.
 * Returns undefined when a valid date cannot be resolved.
 */
export function getPostDateISO(input: unknown): string | undefined {
  const d = resolveToDate(input)
  return d ? d.toISOString() : undefined
}
