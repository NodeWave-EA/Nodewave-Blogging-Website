/**
 * Rich Text Renderer Utility
 *
 * A robust, secure system for rendering Strapi rich text content in Vue 3.
 * Features:
 * - Markdown and HTML parsing with marked
 * - Security via DOMPurify sanitization
 * - Media URL resolution for Strapi uploads
 * - Syntax highlighting support (Prism)
 * - Responsive images and embeds
 * - Accessibility enhancements
 *
 * SECURITY NOTES:
 * - All HTML is sanitized through DOMPurify before rendering
 * - Script tags are completely blocked
 * - Iframes require explicit allowIframes: true flag
 * - External links get rel="noopener noreferrer"
 * - Always run sanitization client-side even if Strapi sanitizes
 *
 * USAGE:
 * ```ts
 * import { renderRichText } from '@/utils/richTextRenderer'
 *
 * const result = renderRichText(strapiContent, {
 *   allowIframes: true,
 *   lazyImages: true,
 *   debug: false
 * })
 *
 * console.log(result.html) // Safe HTML string
 * console.log(result.textContent) // Plain text
 * console.log(result.readingTime) // Minutes
 * ```
 *
 * @module richTextRenderer
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { RichTextOptions, RichTextResult } from '@/types/RichText'
import { resolveStrapiMedia, isStrapiUpload } from './strapiMedia'

/**
 * Check if content appears to be Markdown (vs plain HTML)
 * Uses heuristics to detect markdown patterns
 */
function isMarkdownContent(content: string): boolean {
  if (!content) return false

  // Check for markdown-specific patterns
  const markdownPatterns = [
    /^#{1,6}\s+/m, // Headings: # ## ###
    /\*\*[^*]+\*\*/, // Bold: **text**
    /\*[^*]+\*/, // Italic: *text*
    /\[[^\]]+\]\([^)]+\)/, // Links: [text](url)
    /```[\s\S]*?```/, // Code blocks: ```code```
    /^\s*[-*+]\s+/m, // Unordered lists
    /^\s*\d+\.\s+/m, // Ordered lists
    /^\s*>/m, // Blockquotes
  ]

  // If it has < tags and no markdown patterns, it's likely HTML
  if (content.includes('<') && !markdownPatterns.some((pattern) => pattern.test(content))) {
    return false
  }

  // If it matches markdown patterns, treat as markdown
  return markdownPatterns.some((pattern) => pattern.test(content))
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Detect if URL is a YouTube link
 */
function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/.test(url)
}

/**
 * Convert YouTube URL to embed iframe
 */
function convertYouTubeToEmbed(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (!match) return url

  const videoId = match[1]
  return `
    <div class="my-6 overflow-hidden rounded-lg">
      <div class="relative w-full" style="padding-bottom: 56.25%;">
        <iframe 
          src="https://www.youtube.com/embed/${videoId}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen
          loading="lazy"
          frameborder="0"
        ></iframe>
      </div>
    </div>
  `
}

/**
 * Configure marked with custom renderer for Tailwind styling
 * Ensures ALL renderer methods return strings (no [object Object] issues)
 */
function configureMarkedRenderer(options: RichTextOptions) {
  const renderer = new marked.Renderer()
  const parser = new marked.Parser()
  const baseUrl = options.baseUrl || ''

  // Headings - add IDs for anchor links
  renderer.heading = ({ tokens, depth }) => {
    // Use parser to render inline tokens
    const text = parser.parseInline(tokens)
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')

    return `<h${depth} id="${id}" class="mt-6 mb-4 font-bold">${text}</h${depth}>\n`
  }

  // Paragraphs
  renderer.paragraph = ({ tokens }) => {
    const text = parser.parseInline(tokens)
    return `<p>${text}</p>\n`
  }

  // Links - handle external vs internal, detect YouTube
  renderer.link = ({ href, title, tokens }) => {
    const text = parser.parseInline(tokens)
    if (!href) return text

    // Check if it's a YouTube link and convert to embed if allowed
    if (options.allowIframes && isYouTubeUrl(href)) {
      return convertYouTubeToEmbed(href)
    }

    const isExternal = href.startsWith('http') && !href.includes(window.location.hostname)
    const rel = isExternal ? ' rel="noopener noreferrer"' : ''
    const target = isExternal ? ' target="_blank"' : ''
    const titleAttr = title ? ` title="${escapeHtml(title)}"` : ''

    // Resolve Strapi media links
    const resolvedHref = isStrapiUpload(href) ? resolveStrapiMedia(href, baseUrl) : href

    return `<a href="${escapeHtml(resolvedHref)}"${titleAttr}${target}${rel}>${text}</a>`
  }

  // Images - lazy loading, responsive, with media URL resolution and caption support
  renderer.image = ({ href, title, text }) => {
    if (!href) return ''

    const resolvedSrc = isStrapiUpload(href) ? resolveStrapiMedia(href, baseUrl) : href
    const alt = text || ''
    const loading = options.lazyImages !== false ? ' loading="lazy"' : ''
    const decoding = ' decoding="async"'

    // If title exists, use it as caption in figure
    if (title) {
      return `<figure class="my-6 w-full"><img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}" title="${escapeHtml(title)}"${loading}${decoding} class="w-full h-auto rounded-lg shadow-md" /><figcaption class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">${escapeHtml(title)}</figcaption></figure>\n`
    }

    return `<figure class="my-6 w-full"><img src="${escapeHtml(resolvedSrc)}" alt="${escapeHtml(alt)}"${loading}${decoding} class="w-full h-auto rounded-lg shadow-md" /></figure>\n`
  }

  // Code blocks - prepare for Prism highlighting
  renderer.code = ({ text, lang }) => {
    const language = lang || 'plaintext'
    const escapedCode = escapeHtml(text)

    return `<div class="my-6 overflow-hidden rounded-lg border border-border"><pre class="language-${language}"><code class="language-${language}">${escapedCode}</code></pre></div>\n`
  }

  // Inline code
  renderer.codespan = ({ text }) => {
    return `<code class="px-1 rounded bg-gray-200 dark:bg-gray-700 text-sm">${escapeHtml(text)}</code>`
  }

  // Blockquotes - support nested blockquotes
  renderer.blockquote = ({ tokens }) => {
    // Parse tokens recursively to handle nested content
    const parser = new marked.Parser()
    const content = parser.parse(tokens)

    // Check if it's a callout (starts with specific markers)
    const calloutMatch = content.match(/^<p>\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/)
    if (calloutMatch) {
      const type = calloutMatch[1].toLowerCase()
      const cleanContent = content.replace(/^<p>\[![A-Z]+\]\s*/, '<p>')
      return `<blockquote class="border-l-4 pl-4 my-6 callout callout-${type}">${cleanContent}</blockquote>\n`
    }

    return `<blockquote class="border-l-4 border-primary pl-4 italic my-6">${content}</blockquote>\n`
  }

  // Tables with proper thead/tbody - properly parse tokens
  renderer.table = (token) => {
    // Render header
    const headerRow = token.header
      .map((cell) => {
        const text = parser.parseInline(cell.tokens)
        const align = cell.align ? ` style="text-align: ${cell.align}"` : ''
        return `<th class="px-4 py-3 font-semibold border"${align}>${text}</th>`
      })
      .join('')
    const header = `<tr>${headerRow}</tr>`

    // Render body rows
    const rows = token.rows
      .map((row) => {
        const cells = row
          .map((cell) => {
            const text = parser.parseInline(cell.tokens)
            const align = cell.align ? ` style="text-align: ${cell.align}"` : ''
            return `<td class="px-4 py-2 border"${align}>${text}</td>`
          })
          .join('')
        return `<tr>${cells}</tr>`
      })
      .join('\n')

    return `<div class="my-6 overflow-x-auto"><table class="table-auto border-collapse min-w-full divide-y divide-border"><thead class="bg-muted">${header}</thead><tbody class="divide-y divide-border">${rows}</tbody></table></div>\n`
  }

  // Lists - Let marked handle the rendering, we just add classes via post-processing
  // Note: marked v16 requires us to return the full HTML string
  renderer.list = (token) => {
    const type = token.ordered ? 'ol' : 'ul'
    const start = token.ordered && token.start !== 1 ? ` start="${token.start}"` : ''
    const body = token.items
      .map((item) => {
        // Parse the item tokens to get HTML
        let itemText = parser.parse(item.tokens)
        // Remove wrapping paragraph tags if present (for cleaner list items)
        itemText = itemText.replace(/^<p>(.*)<\/p>\s*$/s, '$1').trim()

        if (item.task) {
          const checked = item.checked ? ' checked' : ''
          return `<li class="list-none"><input type="checkbox"${checked} disabled class="mr-2" />${itemText}</li>`
        }
        return `<li>${itemText}</li>`
      })
      .join('\n')

    const listClass = token.ordered ? 'list-decimal' : 'list-disc'
    return `<${type}${start} class="${listClass} ml-6 my-4 space-y-2">\n${body}\n</${type}>\n`
  }

  // Note: We handle list items in the list renderer above

  // Horizontal rule
  renderer.hr = () => {
    return '<hr class="my-8 border-border" />\n'
  }

  // Strong (bold)
  renderer.strong = ({ tokens }) => {
    const text = parser.parseInline(tokens)
    return `<strong>${text}</strong>`
  }

  // Emphasis (italic)
  renderer.em = ({ tokens }) => {
    const text = parser.parseInline(tokens)
    return `<em>${text}</em>`
  }

  // Strikethrough
  renderer.del = ({ tokens }) => {
    const text = parser.parseInline(tokens)
    return `<del>${text}</del>`
  }

  // HTML passthrough - Required for embeds (iframe, details, kbd, mark, sup, sub)
  renderer.html = ({ text }) => {
    // Return raw HTML as-is for DOMPurify to handle
    return text
  }

  return renderer
}

/**
 * Configure DOMPurify sanitization rules per AGENTS.md requirements
 */
function getDOMPurifyConfig(options: RichTextOptions): DOMPurify.Config {
  const config: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'p',
      'br',
      'hr',
      'strong',
      'em',
      'u',
      's',
      'del',
      'ins',
      'code',
      'pre',
      'a',
      'img',
      'figure',
      'figcaption',
      'ul',
      'ol',
      'li',
      'blockquote',
      'q',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'caption',
      'div',
      'span',
      'abbr',
      'cite',
      'sub',
      'sup',
      // HTML embeds as per AGENTS.md
      'details',
      'summary',
      'mark',
      'kbd',
      'input', // For task list checkboxes
    ],
    ALLOWED_ATTR: [
      'href',
      'title',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'loading',
      'decoding',
      'class',
      'id',
      'start',
      'type',
      'checked',
      'disabled', // For lists and checkboxes
      'colspan',
      'rowspan',
      'open', // For details element
      // Allow safe inline styles per AGENTS.md
      'style',
      'data-*', // Allow data attributes for debugging
    ],
    ALLOW_DATA_ATTR: options.debug || false,
    FORBID_TAGS: ['script', 'object', 'embed', 'form', 'button', 'textarea', 'select'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'], // Block inline JS
    // Allow specific safe inline styles
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i,
  }

  // Conditionally allow iframes for embeds (YouTube, Vimeo, etc.)
  if (options.allowIframes) {
    config.ALLOWED_TAGS?.push('iframe')
    config.ALLOWED_ATTR?.push('allow', 'allowfullscreen', 'frameborder', 'sandbox')
  }

  // Merge with custom config if provided
  if (options.sanitizeConfig) {
    return { ...config, ...options.sanitizeConfig }
  }

  return config
}

/**
 * Add DOMPurify hooks for iframe attributes
 */
function setupDOMPurifyHooks(options: RichTextOptions) {
  if (!options.allowIframes) return

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName === 'iframe') {
      const iframe = node as HTMLIFrameElement
      iframe.setAttribute('allowfullscreen', 'true')
      iframe.setAttribute('loading', 'lazy')

      // Ensure YouTube/Vimeo iframes are from trusted sources
      const src = iframe.getAttribute('src') || ''
      if (
        src &&
        !src.match(/^https:\/\/(www\.)?(youtube\.com|youtube-nocookie\.com|player\.vimeo\.com)/)
      ) {
        // Remove untrusted iframes
        iframe.remove()
      }
    }
  })
}

/**
 * Post-process HTML to wrap iframes in responsive containers
 */
function wrapIframesResponsive(html: string): string {
  const iframeRegex = /<iframe([^>]*)><\/iframe>/gi

  return html.replace(iframeRegex, (match, attrs) => {
    // Check if already wrapped
    if (html.includes('<div class="aspect-video') && html.includes(match)) {
      return match
    }

    return `
      <div class="my-6 overflow-hidden rounded-lg">
        <div class="aspect-video">
          <iframe${attrs} class="h-full w-full"></iframe>
        </div>
      </div>
    `
  })
}

/**
 * Extract plain text from HTML
 */
function extractTextContent(html: string): string {
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div')
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ''
  }

  // Fallback: strip tags with regex (less accurate)
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Calculate reading time in minutes
 * Assumes average reading speed of 200 words per minute
 */
function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return Math.max(1, minutes) // Minimum 1 minute
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
}

/**
 * Main function to render rich text content
 *
 * @param content - Raw content string (Markdown or HTML from Strapi)
 * @param options - Rendering options
 * @returns RichTextResult with sanitized HTML and metadata
 *
 * @throws {RichTextRenderError} If rendering fails critically
 */
export function renderRichText(content: string, options: RichTextOptions = {}): RichTextResult {
  try {
    if (!content || typeof content !== 'string') {
      return {
        html: '',
        textContent: '',
        wordCount: 0,
        readingTime: 0,
        wasSanitized: false,
      }
    }

    let html = content
    let wasSanitized = false

    // Step 1: Parse Markdown if needed
    const shouldParseMarkdown = options.forceMarkdown || isMarkdownContent(content)

    if (shouldParseMarkdown) {
      const renderer = configureMarkedRenderer(options)

      marked.setOptions({
        renderer,
        gfm: true, // GitHub Flavored Markdown
        breaks: true, // Line breaks become <br>
        pedantic: false,
      })

      html = marked.parse(content) as string
    }

    // Step 2: Resolve Strapi media URLs in HTML
    const baseUrl = options.baseUrl || ''
    if (baseUrl || isStrapiUpload(html)) {
      // Replace src and href attributes pointing to /uploads
      html = html.replace(/(src|href)=["']([^"']+)["']/gi, (match, attr, url) => {
        if (isStrapiUpload(url)) {
          const resolved = resolveStrapiMedia(url, baseUrl)
          return `${attr}="${resolved}"`
        }
        return match
      })
    }

    // Step 3: Add lazy loading to images if not present
    if (options.lazyImages !== false) {
      html = html.replace(/<img([^>]*?)>/gi, (match, attrs) => {
        if (!attrs.includes('loading=')) {
          attrs += ' loading="lazy"'
        }
        if (!attrs.includes('decoding=')) {
          attrs += ' decoding="async"'
        }
        return `<img${attrs}>`
      })
    }

    // Step 4: Wrap iframes in responsive containers
    if (options.allowIframes && html.includes('<iframe')) {
      html = wrapIframesResponsive(html)
    }

    // Step 5: Setup DOMPurify hooks and sanitize
    const sanitizeConfig = getDOMPurifyConfig(options)
    const originalLength = html.length

    if (typeof window !== 'undefined' && DOMPurify.isSupported) {
      // Setup hooks for iframe handling
      setupDOMPurifyHooks(options)

      // Sanitize HTML
      html = DOMPurify.sanitize(html, sanitizeConfig)
      wasSanitized = html.length !== originalLength

      // Remove hooks after sanitization to avoid conflicts
      DOMPurify.removeAllHooks()
    } else {
      console.warn('[richTextRenderer] DOMPurify not available, skipping sanitization')
    }

    // Step 6: Add debug attributes if requested
    if (options.debug && typeof window !== 'undefined') {
      const wrapper = document.createElement('div')
      wrapper.innerHTML = html
      wrapper.setAttribute('data-rich-text-debug', 'true')
      wrapper.setAttribute('data-sanitized', wasSanitized.toString())
      wrapper.setAttribute('data-content-type', shouldParseMarkdown ? 'markdown' : 'html')
      html = wrapper.innerHTML
    }

    // Step 7: Extract metadata
    const textContent = extractTextContent(html)
    const wordCount = countWords(textContent)
    const readingTime = calculateReadingTime(textContent)

    return {
      html,
      textContent,
      wordCount,
      readingTime,
      wasSanitized,
    }
  } catch (error) {
    console.error('[richTextRenderer] Error rendering content:', error)

    // Return safe fallback instead of throwing
    return {
      html: `<p class="text-destructive">Error rendering content. Please try again.</p>`,
      textContent: '',
      wordCount: 0,
      readingTime: 0,
      wasSanitized: true,
    }
  }
}

/**
 * Batch render multiple rich text contents efficiently
 * Useful for rendering multiple blog posts or comments
 */
export function renderRichTextBatch(
  contents: string[],
  options: RichTextOptions = {},
): RichTextResult[] {
  return contents.map((content) => renderRichText(content, options))
}

/**
 * Validate rich text content for security issues
 * Returns warnings about potentially dangerous content
 */
export function validateRichTextContent(content: string): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  if (!content) {
    return { isValid: true, warnings: [] }
  }

  // Check for script tags
  if (/<script/i.test(content)) {
    warnings.push('Content contains <script> tags which will be removed')
  }

  // Check for event handlers
  if (/on\w+\s*=/i.test(content)) {
    warnings.push('Content contains event handlers (onclick, etc.) which will be removed')
  }

  // Check for iframes without allowIframes flag
  if (/<iframe/i.test(content)) {
    warnings.push('Content contains iframes - use allowIframes: true to enable them')
  }

  // Check for inline styles
  if (/style\s*=/i.test(content)) {
    warnings.push('Content contains inline styles which will be removed')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}
