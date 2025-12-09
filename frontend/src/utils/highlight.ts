import DOMPurify from 'dompurify'
import { renderRichText } from './richTextRenderer'

function escapeRegex(s: string) {
  return s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

/**
 * Highlight search query in HTML content (preserves HTML structure)
 * @param html - HTML content to highlight in
 * @param query - Search query to highlight
 * @returns HTML with highlighted matches
 */
function highlightInHTML(html: string, query: string): string {
  if (!html || !query) return html

  const q = query.trim()
  if (!q) return html

  const tokens = q.split(/\s+/).filter(Boolean)
  const tokenRegex = new RegExp(tokens.map(escapeRegex).join('|'), 'ig')

  // Parse HTML and highlight text nodes only (preserve structure)
  const temp = document.createElement('div')
  temp.innerHTML = html

  function highlightNode(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || ''
      if (tokenRegex.test(text)) {
        const highlighted = text.replace(
          tokenRegex,
          (m) => `<mark class="bg-yellow-200 dark:bg-yellow-600 rounded px-0.5">${m}</mark>`,
        )
        const span = document.createElement('span')
        span.innerHTML = highlighted
        node.parentNode?.replaceChild(span, node)
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip highlighting in certain elements
      const el = node as Element
      if (!['SCRIPT', 'STYLE', 'CODE', 'PRE', 'MARK'].includes(el.tagName)) {
        Array.from(node.childNodes).forEach(highlightNode)
      }
    }
  }

  highlightNode(temp)
  return temp.innerHTML
}

// Highlight query tokens in text; fallback to fuzzy character matching when no token matches
export function highlightText(text: string, query: string): string {
  if (!text || !query) return DOMPurify.sanitize(text)

  const original = String(text)
  const q = query.trim()
  if (!q) return DOMPurify.sanitize(original)

  const tokens = q.split(/\s+/).filter(Boolean)

  // Try token-based highlighting first
  const tokenRegex = new RegExp(tokens.map(escapeRegex).join('|'), 'ig')
  if (tokenRegex.test(original)) {
    const replaced = original.replace(
      tokenRegex,
      (m) => `<mark class="bg-yellow-200 dark:bg-yellow-600 rounded px-0.5">${m}</mark>`,
    )
    return DOMPurify.sanitize(replaced, {
      ALLOWED_TAGS: ['mark', 'b', 'i', 'strong', 'em', 'u', 'br', 'p', 'div', 'span'],
      ALLOWED_ATTR: ['class'],
    })
  }

  // Fuzzy fallback: highlight characters in sequence (first-match order)
  const chars = q.replace(/\s+/g, '').toLowerCase().split('')
  if (chars.length === 0) return DOMPurify.sanitize(original)

  let result = ''
  let ci = 0
  for (let i = 0; i < original.length; i++) {
    const ch = original[i]
    if (ci < chars.length && ch.toLowerCase() === chars[ci]) {
      result += `<mark class="bg-yellow-200 dark:bg-yellow-600 rounded px-0.5">${ch}</mark>`
      ci++
    } else {
      result += ch
    }
  }

  return DOMPurify.sanitize(result, {
    ALLOWED_TAGS: ['mark', 'b', 'i', 'strong', 'em', 'u', 'br', 'p', 'div', 'span'],
    ALLOWED_ATTR: ['class'],
  })
}

/**
 * Render markdown/rich text and then highlight search query matches
 * @param content - Markdown or rich text content
 * @param query - Search query to highlight
 * @returns Rendered HTML with highlighted matches
 */
export function renderAndHighlight(content: string, query: string): string {
  if (!content) return ''

  try {
    // First, render the markdown to HTML
    const result = renderRichText(content, {
      allowIframes: false,
      lazyImages: false,
      forceMarkdown: true,
    })

    // Then highlight the query in the rendered HTML
    if (query && typeof document !== 'undefined') {
      return highlightInHTML(result.html, query)
    }

    return result.html
  } catch (error) {
    console.error('[highlight] Error rendering and highlighting:', error)
    // Fallback to simple highlighting
    return highlightText(content, query)
  }
}
