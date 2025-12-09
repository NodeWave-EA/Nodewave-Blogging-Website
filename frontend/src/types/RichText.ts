/**
 * Rich Text Rendering Type Definitions
 *
 * Types for the rich text rendering system used throughout the application.
 * Provides type safety for rendering Strapi content with sanitization and formatting.
 */

/**
 * Configuration options for rendering rich text content
 */
export interface RichTextOptions {
  /**
   * Base URL for resolving relative media paths (defaults to VITE_API_BASE_URL)
   */
  baseUrl?: string

  /**
   * Whether to allow iframe elements in the rendered HTML (default: false)
   * When true, iframes are sanitized and wrapped in responsive containers
   */
  allowIframes?: boolean

  /**
   * Enable lazy loading for images (default: true)
   * Adds loading="lazy" and decoding="async" attributes
   */
  lazyImages?: boolean

  /**
   * Custom DOMPurify sanitization configuration
   * Allows fine-tuning of allowed tags, attributes, and other sanitization rules
   */
  sanitizeConfig?: Record<string, unknown>

  /**
   * Enable debug mode to add data attributes for troubleshooting (default: false)
   */
  debug?: boolean

  /**
   * Force treat content as Markdown even if it looks like HTML (default: false)
   */
  forceMarkdown?: boolean

  /**
   * Enable automatic linking of plain URLs (default: true)
   */
  autoLink?: boolean

  /**
   * Custom CSS classes to add to the root element
   */
  className?: string
}

/**
 * Result of rendering rich text content
 */
export interface RichTextResult {
  /**
   * The sanitized HTML string ready for rendering
   */
  html: string

  /**
   * Plain text content with HTML tags stripped (useful for excerpts, SEO)
   */
  textContent: string

  /**
   * Number of words in the content
   */
  wordCount: number

  /**
   * Estimated reading time in minutes
   */
  readingTime: number

  /**
   * Whether the content contains potentially unsafe elements that were sanitized
   */
  wasSanitized: boolean
}

/**
 * Error types that can occur during rich text rendering
 */
export class RichTextRenderError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error,
    public readonly content?: string,
  ) {
    super(message)
    this.name = 'RichTextRenderError'
  }
}

/**
 * Image metadata extracted from rendered content
 */
export interface RichTextImage {
  src: string
  alt: string
  title?: string
  width?: number
  height?: number
}

/**
 * Link metadata extracted from rendered content
 */
export interface RichTextLink {
  href: string
  text: string
  isExternal: boolean
}

/**
 * Metadata about rendered content
 */
export interface RichTextMetadata {
  images: RichTextImage[]
  links: RichTextLink[]
  headings: Array<{ level: number; text: string; id: string }>
  hasCodeBlocks: boolean
  hasEmbeds: boolean
  hasTables: boolean
}
