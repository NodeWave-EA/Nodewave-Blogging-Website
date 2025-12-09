/**
 * Utility functions for handling Strapi images and data structures
 */

import { usePlaceholderStore } from '@/stores/placeholder'
import type { Category, StrapiImage } from '@/types'
import { dbg, moduleLoaded } from './debug'

const strapiBaseUrl = import.meta.env.VITE_STRAPI_BASE_URL
const _placeholderPath =
  import.meta.env.VITE_PLACEHOLDER_IMAGE_PATH || '/uploads/placeholder-image.jpg'
const placeholderImageUrl = `${strapiBaseUrl.replace(/\/$/, '')}${_placeholderPath.startsWith('/') ? '' : '/'}${_placeholderPath}`
const PLACEHOLDER_LOCALSTORAGE_KEY = 'nw_placeholder_image_url'

moduleLoaded('strapi.ts')

/**
 * Extracts the URL from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | StrapiImage | null
 * @returns string | null - The image URL or null if not available
 */
export function getStrapiImageUrl(
  image?: StrapiImage | { data?: StrapiImage | StrapiImage[] | null } | StrapiImage[] | null,
): string | null {
  dbg('strapi.ts [getStrapiImageUrl]', 'getStrapiImageUrl', { image })

  const normalized: StrapiImage | null = normalizeImageShape(image)

  if (normalized && normalized.url) {
    if (normalized.url.startsWith('/')) {
      dbg('strapi.ts [getStrapiImageUrl]', 'relative URL detected, prepending base URL', {
        strapiBaseUrl,
        imageUrl: normalized.url,
      })
      return `${strapiBaseUrl.replace(/\/$/, '')}${normalized.url}`
    }
    return normalized.url
  }

  // No image found — attempt to read placeholder from Pinia store, then localStorage, then fallback constant
  try {
    const store = usePlaceholderStore()
    const url = store.getPlaceholderSync() || store.url
    if (url) return url
  } catch (err) {
    dbg('strapi.ts [getStrapiImageUrl]', 'pinia placeholder access failed', { err })
  }

  try {
    const saved = localStorage.getItem(PLACEHOLDER_LOCALSTORAGE_KEY)
    if (saved) return saved
  } catch (err) {
    dbg('strapi.ts [getStrapiImageUrl]', 'localStorage read failed', { err })
  }

  return placeholderImageUrl
}

/**
 * Extracts the caption from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | StrapiImage | null
 * @returns string | null - The image caption or null if not available
 */
export function getStrapiImageCaption(image?: StrapiImage | { data?: StrapiImage | null } | null) {
  const img = normalizeImageShape(image)
  dbg('strapi.ts [getStrapiImageCaption]', 'getStrapiImageCaption', { img })
  if (!img) return null
  return img.caption || null
}

/**
 * Extracts the alternative text from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | StrapiImage | null
 * @returns string | null - The image alternative text or null if not available
 */
export function getStrapiImageAltText(image?: StrapiImage | { data?: StrapiImage | null } | null) {
  const img = normalizeImageShape(image)
  dbg('strapi.ts [getStrapiImageAltText]', 'getStrapiImageAltText', { img })
  if (!img) return null
  return img.alternativeText || null
}

// Backwards-compatible alias
export const getStrapiImageAlt = getStrapiImageAltText

/**
 * Extracts the width from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | StrapiImage | null
 * @returns number | null - The image width or null if not available
 */
export function getStrapiImageWidth(image?: StrapiImage | { data?: StrapiImage | null } | null) {
  const img = normalizeImageShape(image)
  dbg('strapi.ts [getStrapiImageWidth]', 'getStrapiImageWidth', { img })
  if (!img) return null
  return img.width || null
}

/**
 * Extracts the height from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | StrapiImage | null
 * @returns number | null - The image height or null if not available
 */
export function getStrapiImageHeight(image?: StrapiImage | { data?: StrapiImage | null } | null) {
  const img = normalizeImageShape(image)
  dbg('strapi.ts [getStrapiImageHeight]', 'getStrapiImageHeight', { img })
  if (!img) return null
  return img.height || null
}

/**
 * Get categories color from Strapi category object
 * @param category - Strapi category object with color property
 * @returns string - The category color or a default color if not available
 */
export function getStrapiCategoryColor(category: Category) {
  dbg('strapi.ts [getStrapiCategoryColor]', 'getStrapiCategoryColor', { category })
  return category?.color || 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
}

// Helper to turn multiple accepted shapes into a single StrapiImage or null
function normalizeImageShape(
  image?: StrapiImage | { data?: StrapiImage | StrapiImage[] | null } | StrapiImage[] | null,
): StrapiImage | null {
  if (!image) return null
  // If it's an array, use the first item
  if (Array.isArray(image)) return (image.length > 0 ? image[0] : null) as StrapiImage | null
  // If it's an object with a `data` prop
  if (typeof image === 'object' && 'data' in image) {
    const d = (image as { data?: StrapiImage | StrapiImage[] | null }).data
    if (!d) return null
    if (Array.isArray(d)) return (d.length > 0 ? d[0] : null) as StrapiImage | null
    return d as StrapiImage
  }
  // Otherwise assume it's a StrapiImage
  return image as StrapiImage
}
