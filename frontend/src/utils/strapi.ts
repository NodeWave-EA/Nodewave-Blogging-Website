/**
 * Utility functions for handling Strapi images and data structures
 */

import type { StrapiImage } from '@/types'

/**
 * Extracts the URL from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @returns string | null - The image URL or null if not available
 */
export function getStrapiImageUrl(
  image: { data: StrapiImage | null } | null | undefined,
): string | null {
  return image?.data?.url || null
}

/**
 * Extracts the alternative text from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @returns string | null - The alternative text or null if not available
 */
export function getStrapiImageAlt(
  image: { data: StrapiImage | null } | null | undefined,
): string | null {
  return image?.data?.alternativeText || null
}

/**
 * Gets both URL and alt text from a Strapi image structure
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @returns object with url and alt properties
 */
export function getStrapiImageData(image: { data: StrapiImage | null } | null | undefined): {
  url: string | null
  alt: string | null
} {
  return {
    url: getStrapiImageUrl(image),
    alt: getStrapiImageAlt(image),
  }
}

/**
 * Builds a full URL for a Strapi image
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @param baseUrl - Base URL for the Strapi instance (optional)
 * @returns string | null - The full image URL or null if not available
 */
export function getStrapiImageFullUrl(
  image: { data: StrapiImage | null } | null | undefined,
  baseUrl?: string,
): string | null {
  const url = getStrapiImageUrl(image)
  if (!url) return null

  // If URL is already absolute, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // If baseUrl is provided and URL is relative, combine them
  if (baseUrl) {
    return `${baseUrl.replace(/\/$/, '')}${url}`
  }

  return url
}

/**
 * Checks if a Strapi image exists and has a valid URL
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @returns boolean - True if image exists and has a URL
 */
export function hasStrapiImage(image: { data: StrapiImage | null } | null | undefined): boolean {
  return !!image?.data?.url
}

/**
 * Gets responsive image URLs from Strapi formats
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @returns object with different size URLs
 */
export function getStrapiImageFormats(image: { data: StrapiImage | null } | null | undefined): {
  thumbnail?: string
  small?: string
  medium?: string
  large?: string
  original: string | null
} {
  const imageData = image?.data
  if (!imageData) return { original: null }

  const formats = (imageData.formats as Record<string, { url: string }>) || {}

  return {
    thumbnail: formats.thumbnail?.url,
    small: formats.small?.url,
    medium: formats.medium?.url,
    large: formats.large?.url,
    original: imageData.url,
  }
}

/**
 * Creates a srcset string for responsive images
 * @param image - Strapi image structure: { data: StrapiImage | null } | null
 * @param baseUrl - Base URL for the Strapi instance (optional)
 * @returns string - srcset string for responsive images
 */
export function getStrapiImageSrcSet(
  image: { data: StrapiImage | null } | null | undefined,
  baseUrl?: string,
): string {
  const formats = getStrapiImageFormats(image)
  const srcSet: string[] = []

  if (formats.small) {
    srcSet.push(`${baseUrl ? baseUrl + formats.small : formats.small} 500w`)
  }
  if (formats.medium) {
    srcSet.push(`${baseUrl ? baseUrl + formats.medium : formats.medium} 750w`)
  }
  if (formats.large) {
    srcSet.push(`${baseUrl ? baseUrl + formats.large : formats.large} 1000w`)
  }
  if (formats.original) {
    srcSet.push(`${baseUrl ? baseUrl + formats.original : formats.original} 1920w`)
  }

  return srcSet.join(', ')
}
