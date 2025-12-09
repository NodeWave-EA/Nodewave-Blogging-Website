/**
 * Strapi Media URL Resolution Utility
 *
 * Handles conversion of relative Strapi media URLs to absolute URLs
 * using environment configuration (VITE_API_BASE_URL or VITE_MEDIA_CDN_URL).
 *
 * @example
 * ```ts
 * import { resolveStrapiMedia, getStrapiImageUrl } from '@/utils/strapiMedia'
 *
 * // Resolve a media URL
 * const imageUrl = resolveStrapiMedia('/uploads/image_123.jpg')
 * // => 'http://localhost:1337/uploads/image_123.jpg'
 *
 * // Get optimized image URL with transformations
 * const thumbnail = getStrapiImageUrl('/uploads/image.jpg', { width: 300, height: 300 })
 * ```
 */

/**
 * Get the base URL for Strapi API from environment variables
 * Prioritizes CDN URL if available, falls back to API base URL
 */
export function getStrapiBaseUrl(): string {
  // Check for CDN URL first (for production optimization)
  const cdnUrl = import.meta.env.VITE_MEDIA_CDN_URL
  if (cdnUrl && typeof cdnUrl === 'string') {
    return cdnUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Fall back to API base URL
  const apiUrl = import.meta.env.VITE_API_BASE_URL
  if (apiUrl && typeof apiUrl === 'string') {
    return apiUrl.replace(/\/$/, '') // Remove trailing slash
  }

  // Development fallback
  if (import.meta.env.DEV) {
    console.warn('[strapiMedia] VITE_API_BASE_URL not set, using default: http://localhost:1337')
    return 'http://localhost:1337'
  }

  // Production fallback - this should not happen
  console.error('[strapiMedia] No base URL configured for media resolution')
  return ''
}

/**
 * Check if a URL is absolute (has a protocol)
 */
export function isAbsoluteUrl(url: string): boolean {
  if (!url) return false
  try {
    // Check for protocol at the start
    return /^(https?:)?\/\//i.test(url) || new URL(url).protocol !== ''
  } catch {
    return false
  }
}

/**
 * Resolve a Strapi media URL to an absolute URL
 *
 * @param url - The URL to resolve (can be relative or absolute)
 * @param baseUrl - Optional custom base URL (overrides environment config)
 * @returns Absolute URL string
 *
 * @example
 * ```ts
 * resolveStrapiMedia('/uploads/image.jpg')
 * // => 'http://localhost:1337/uploads/image.jpg'
 *
 * resolveStrapiMedia('http://cdn.example.com/image.jpg')
 * // => 'http://cdn.example.com/image.jpg' (unchanged)
 *
 * resolveStrapiMedia('/uploads/image.jpg', 'https://custom.cdn.com')
 * // => 'https://custom.cdn.com/uploads/image.jpg'
 * ```
 */
export function resolveStrapiMedia(url: string, baseUrl?: string): string {
  if (!url) return ''

  // Return absolute URLs as-is
  if (isAbsoluteUrl(url)) {
    return url
  }

  // Get base URL from parameter or environment
  const base = baseUrl || getStrapiBaseUrl()

  // Ensure URL starts with /
  const path = url.startsWith('/') ? url : `/${url}`

  // Combine base and path
  return `${base}${path}`
}

/**
 * Image transformation options for Strapi image service
 */
export interface StrapiImageOptions {
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Image format (webp, jpeg, png, auto) */
  format?: 'webp' | 'jpeg' | 'png' | 'auto'
  /** Quality (1-100) */
  quality?: number
  /** Fit mode (cover, contain, fill, inside, outside) */
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
}

/**
 * Generate a Strapi image URL with transformations
 * Note: This requires Strapi image optimization plugin to be configured
 *
 * @param url - Original image URL
 * @param options - Transformation options
 * @returns URL with transformation parameters
 *
 * @example
 * ```ts
 * getStrapiImageUrl('/uploads/photo.jpg', {
 *   width: 800,
 *   height: 600,
 *   format: 'webp',
 *   quality: 80
 * })
 * ```
 */
export function getStrapiImageUrl(url: string, options: StrapiImageOptions = {}): string {
  if (!url) return ''

  const resolvedUrl = resolveStrapiMedia(url)

  // If no transformations requested, return as-is
  if (Object.keys(options).length === 0) {
    return resolvedUrl
  }

  try {
    const urlObj = new URL(resolvedUrl)

    // Add transformation parameters
    if (options.width) urlObj.searchParams.set('width', options.width.toString())
    if (options.height) urlObj.searchParams.set('height', options.height.toString())
    if (options.format) urlObj.searchParams.set('format', options.format)
    if (options.quality) urlObj.searchParams.set('quality', options.quality.toString())
    if (options.fit) urlObj.searchParams.set('fit', options.fit)

    return urlObj.toString()
  } catch (error) {
    console.error('[strapiMedia] Failed to create image URL with transformations:', error)
    return resolvedUrl
  }
}

/**
 * Extract all media URLs from HTML content and resolve them
 * Useful for preloading or analyzing content
 *
 * @param html - HTML content containing media URLs
 * @param baseUrl - Optional custom base URL
 * @returns Array of resolved absolute URLs
 */
export function extractAndResolveMediaUrls(html: string, baseUrl?: string): string[] {
  const urls: string[] = []

  // Match src and href attributes
  const srcRegex = /(?:src|href)=["']([^"']+)["']/gi
  let match

  while ((match = srcRegex.exec(html)) !== null) {
    const url = match[1]
    if (url && (url.startsWith('/uploads') || url.startsWith('uploads'))) {
      urls.push(resolveStrapiMedia(url, baseUrl))
    }
  }

  return [...new Set(urls)] // Remove duplicates
}

/**
 * Check if a URL points to a Strapi upload
 */
export function isStrapiUpload(url: string): boolean {
  if (!url) return false
  return url.includes('/uploads/') || url.startsWith('uploads/')
}

/**
 * Get the filename from a Strapi media URL
 */
export function getMediaFilename(url: string): string {
  if (!url) return ''
  try {
    const pathname = new URL(url).pathname
    return pathname.split('/').pop() || ''
  } catch {
    // Not a valid URL, try splitting the string
    return url.split('/').pop() || ''
  }
}

/**
 * Get the file extension from a media URL
 */
export function getMediaExtension(url: string): string {
  const filename = getMediaFilename(url)
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : ''
}

/**
 * Check if a URL is an image based on extension
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']
  const ext = getMediaExtension(url)
  return imageExtensions.includes(ext)
}

/**
 * Check if a URL is a video based on extension
 */
export function isVideoUrl(url: string): boolean {
  const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'wmv', 'flv', 'm4v']
  const ext = getMediaExtension(url)
  return videoExtensions.includes(ext)
}
