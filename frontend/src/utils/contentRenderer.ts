/**
 * Content Renderer Utility
 * Handles all content transformations from Strapi before rendering
 */

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import type { BlogPost } from '@/types'

// Configure marked options for security and performance
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert '\n' to <br>
})

// Custom renderer for better control
const renderer = new marked.Renderer()

// Override link renderer to add security attributes
renderer.link = ({ href, title, tokens }) => {
  const text = marked.parser(tokens || [], marked.defaults)
  const isExternal = href && (href.startsWith('http') || href.startsWith('//'))
  const target = isExternal ? ' target="_blank"' : ''
  const rel = isExternal ? ' rel="noopener noreferrer"' : ''
  const titleAttr = title ? ` title="${title}"` : ''

  return `<a href="${href}"${titleAttr}${target}${rel}>${text}</a>`
}

// Override image renderer for better styling
renderer.image = ({ href, title, text }) => {
  const titleAttr = title ? ` title="${title}"` : ''
  const altAttr = text ? ` alt="${text}"` : ''

  return `<img src="${href}"${altAttr}${titleAttr} class="w-full h-auto rounded-lg shadow-lg my-6" loading="lazy" />`
}

// Override code block renderer for syntax highlighting preparation
renderer.code = ({ text, lang }) => {
  const language = lang || 'text'
  return `<pre class="bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto my-4"><code class="language-${language}">${text}</code></pre>`
}

// Override blockquote for better styling
renderer.blockquote = (quote) => {
  return `<blockquote class="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100">${quote}</blockquote>`
}

marked.use({ renderer })

/**
 * Safely render markdown content to HTML
 */
export function renderMarkdown(content: string): string {
  if (!content || typeof content !== 'string') {
    return ''
  }

  try {
    // Use sync parsing for simpler handling
    const html = marked.parse(content) as string

    // Then sanitize the HTML to prevent XSS attacks
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'a',
        'img',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'div',
        'span',
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'title',
        'src',
        'alt',
        'width',
        'height',
        'class',
        'id',
      ],
      ALLOW_DATA_ATTR: false,
    })
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return DOMPurify.sanitize(content)
  }
}

/**
 * Process blog post content with markdown rendering
 */
export function processPostContent(post: BlogPost): string {
  if (!post.content) {
    return ''
  }

  // Check if content is already HTML or markdown
  const isMarkdown = !post.content.trim().startsWith('<')

  if (isMarkdown) {
    return renderMarkdown(post.content)
  } else {
    // If it's already HTML, just sanitize it
    return DOMPurify.sanitize(post.content, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'a',
        'img',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'div',
        'span',
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'title',
        'src',
        'alt',
        'width',
        'height',
        'class',
        'id',
      ],
    })
  }
}

/**
 * Generate a clean excerpt from content
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  if (!content) return ''

  // Remove HTML tags and markdown syntax
  const cleanText = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_`~]/g, '') // Remove markdown syntax
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim()

  if (cleanText.length <= maxLength) {
    return cleanText
  }

  // Find the last complete word within the limit
  const truncated = cleanText.substring(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace) + '...'
  }

  return truncated + '...'
}

/**
 * Estimate reading time based on content
 */
export function calculateReadingTime(content: string): number {
  if (!content) return 1

  // Remove HTML tags and count words
  const cleanText = content.replace(/<[^>]*>/g, ' ')
  const wordCount = cleanText.split(/\s+/).filter((word) => word.length > 0).length

  // Average reading speed is 200-250 words per minute
  const wordsPerMinute = 225
  const readingTime = Math.ceil(wordCount / wordsPerMinute)

  return Math.max(1, readingTime) // Minimum 1 minute
}

/**
 * Extract headings from content for table of contents
 */
export function extractHeadings(content: string): Array<{
  id: string
  level: number
  text: string
}> {
  if (!content) return []

  const headings: Array<{ id: string; level: number; text: string }> = []
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>(.*?)<\/h[1-6]>/gi

  let match
  while ((match = headingRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const id = match[2]
    const text = match[3].replace(/<[^>]*>/g, '') // Remove any nested HTML

    headings.push({ id, level, text })
  }

  return headings
}

/**
 * Generate table of contents HTML
 */
export function generateTableOfContents(
  headings: Array<{
    id: string
    level: number
    text: string
  }>,
): string {
  if (headings.length === 0) return ''

  let toc = '<div class="table-of-contents"><h3>Table of Contents</h3><ul>'

  headings.forEach((heading) => {
    const indent = 'margin-left: ' + (heading.level - 1) * 20 + 'px'
    toc += `<li style="${indent}"><a href="#${heading.id}">${heading.text}</a></li>`
  })

  toc += '</ul></div>'

  return toc
}

/**
 * Process content for search indexing
 */
export function extractSearchableText(content: string): string {
  if (!content) return ''

  // Remove HTML tags and normalize whitespace
  return content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Add responsive classes to images in content
 */
export function makeImagesResponsive(content: string): string {
  if (!content) return ''

  return content.replace(
    /<img([^>]*)>/gi,
    '<img$1 class="w-full h-auto rounded-lg shadow-lg my-6" loading="lazy">',
  )
}

/**
 * Process external links to add security attributes
 */
export function processExternalLinks(content: string): string {
  if (!content) return ''

  return content.replace(
    /<a\s+([^>]*?)href="(https?:\/\/[^"]*)"([^>]*?)>/gi,
    '<a $1href="$2"$3 target="_blank" rel="noopener noreferrer">',
  )
}

/**
 * Main content processing function that applies all transformations
 */
export function processContent(
  content: string,
  options: {
    renderMarkdown?: boolean
    makeResponsive?: boolean
    processLinks?: boolean
    sanitize?: boolean
  } = {},
): string {
  if (!content) return ''

  const {
    renderMarkdown: shouldRenderMarkdown = true,
    makeResponsive = true,
    processLinks = true,
    sanitize = true,
  } = options

  let processedContent = content

  // Step 1: Render markdown if needed
  if (shouldRenderMarkdown && !content.trim().startsWith('<')) {
    processedContent = renderMarkdown(processedContent)
  }

  // Step 2: Make images responsive
  if (makeResponsive) {
    processedContent = makeImagesResponsive(processedContent)
  }

  // Step 3: Process external links
  if (processLinks) {
    processedContent = processExternalLinks(processedContent)
  }

  // Step 4: Final sanitization
  if (sanitize) {
    processedContent = DOMPurify.sanitize(processedContent, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'a',
        'img',
        'ul',
        'ol',
        'li',
        'blockquote',
        'pre',
        'code',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
        'div',
        'span',
      ],
      ALLOWED_ATTR: [
        'href',
        'target',
        'rel',
        'title',
        'src',
        'alt',
        'width',
        'height',
        'class',
        'id',
        'style',
        'loading',
      ],
    })
  }

  return processedContent
}

/**
 * Utility to truncate HTML content while preserving structure
 */
export function truncateHTML(html: string, maxLength: number = 200): string {
  if (!html) return ''

  // Create a temporary element to work with
  const temp = document.createElement('div')
  temp.innerHTML = html

  let textLength = 0
  let truncated = false

  function truncateNode(node: Node): void {
    if (truncated) return

    if (node.nodeType === Node.TEXT_NODE) {
      const textContent = node.textContent || ''
      if (textLength + textContent.length > maxLength) {
        const remainingLength = maxLength - textLength
        node.textContent = textContent.substring(0, remainingLength) + '...'
        truncated = true
      } else {
        textLength += textContent.length
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes)
      for (const child of children) {
        truncateNode(child)
        if (truncated) break
      }
    }
  }

  truncateNode(temp)
  return temp.innerHTML
}
