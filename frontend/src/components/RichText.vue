<template>
  <div
    v-if="!error && html"
    ref="containerRef"
    :class="computedClasses"
    :aria-label="ariaLabel"
    :role="role"
    v-html="html"
  />

  <div
    v-else-if="error"
    class="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive"
    role="alert"
  >
    <p class="font-medium">Failed to render content</p>
    <p class="mt-1 text-sm">{{ error }}</p>
  </div>

  <div
    v-else-if="isLoading"
    class="flex items-center justify-center py-8"
    role="status"
    aria-live="polite"
  >
    <div
      class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
    ></div>
    <span class="sr-only">Loading content...</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRichText } from '@/composables/useRichText'
import type { RichTextOptions } from '@/types/RichText'
import Prism from 'prismjs'

// Import common Prism language support
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-graphql'

/**
 * RichText Component
 *
 * A reusable component for safely rendering rich text content from Strapi.
 * Features syntax highlighting, lazy loading, responsive embeds, and accessibility.
 *
 * @example
 * ```vue
 * <RichText
 *   :content="post.attributes.content"
 *   class="prose lg:prose-xl"
 *   :allow-iframes="true"
 *   :lazy-images="true"
 *   @rendered="handleRendered"
 * />
 * ```
 */

export interface RichTextProps {
  /** Raw content from Strapi (HTML or Markdown) */
  content: string

  /** Treat content as HTML (false) or force Markdown parsing (true) */
  asMarkdown?: boolean

  /** Allow iframe elements (for YouTube, Vimeo embeds, etc.) */
  allowIframes?: boolean

  /** Enable lazy loading for images */
  lazyImages?: boolean

  /** Additional CSS classes (use Tailwind prose classes) */
  className?: string

  /** Base URL for resolving Strapi media (defaults to VITE_API_BASE_URL) */
  baseUrl?: string

  /** Enable debug mode with data attributes */
  debug?: boolean

  /** ARIA label for accessibility */
  ariaLabel?: string

  /** ARIA role (defaults to 'article') */
  role?: string

  /** Auto-highlight code blocks with Prism */
  enableSyntaxHighlighting?: boolean

  /** Observe images for lazy loading (uses IntersectionObserver) */
  observeLazyLoad?: boolean
}

const props = withDefaults(defineProps<RichTextProps>(), {
  asMarkdown: false,
  allowIframes: false,
  lazyImages: true,
  className: '',
  baseUrl: '',
  debug: false,
  ariaLabel: '',
  role: 'article',
  enableSyntaxHighlighting: true,
  observeLazyLoad: false,
})

// Emits
const emit = defineEmits<{
  /** Emitted when content is successfully rendered */
  rendered: [result: { html: string; wordCount: number; readingTime: number }]

  /** Emitted when rendering fails */
  error: [error: string]

  /** Emitted when code blocks are highlighted */
  highlighted: []
}>()

// Component state
const containerRef = ref<HTMLElement | null>(null)
const intersectionObserver = ref<IntersectionObserver | null>(null)

// Use rich text composable
const { html, wordCount, readingTime, error, isLoading, renderContent } = useRichText()

// Computed classes
const computedClasses = computed(() => {
  const classes = ['rich-text-content']

  // Add prose classes if not already present
  if (!props.className.includes('prose')) {
    classes.push('prose', 'prose-lg', 'dark:prose-invert', 'max-w-none')
  }

  if (props.className) {
    classes.push(props.className)
  }

  return classes.join(' ')
})

/**
 * Highlight code blocks with Prism
 */
const highlightCodeBlocks = async (): Promise<void> => {
  if (!props.enableSyntaxHighlighting || !containerRef.value) return

  await nextTick()

  try {
    const codeBlocks = containerRef.value.querySelectorAll('pre code')

    if (codeBlocks.length === 0) return

    codeBlocks.forEach((block) => {
      // Only highlight if not already highlighted
      if (!block.classList.contains('prism-highlighted')) {
        Prism.highlightElement(block as HTMLElement)
        block.classList.add('prism-highlighted')
      }
    })

    emit('highlighted')
  } catch (err) {
    console.error('[RichText] Prism highlighting error:', err)
  }
}

/**
 * Set up IntersectionObserver for lazy loading images
 */
const setupLazyLoadObserver = (): void => {
  if (!props.observeLazyLoad || !containerRef.value) return

  if (typeof IntersectionObserver === 'undefined') {
    console.warn('[RichText] IntersectionObserver not supported')
    return
  }

  intersectionObserver.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement

          // Load image if data-src is present (for custom lazy loading)
          if (img.dataset.src) {
            img.src = img.dataset.src
            delete img.dataset.src
          }

          // Stop observing once loaded
          intersectionObserver.value?.unobserve(img)
        }
      })
    },
    {
      rootMargin: '50px 0px', // Start loading 50px before entering viewport
      threshold: 0.01,
    },
  )

  // Observe all images
  const images = containerRef.value.querySelectorAll('img[loading="lazy"]')
  images.forEach((img) => {
    intersectionObserver.value?.observe(img)
  })
}

/**
 * Clean up observers
 */
const cleanupObservers = (): void => {
  if (intersectionObserver.value) {
    intersectionObserver.value.disconnect()
    intersectionObserver.value = null
  }
}

/**
 * Render the content
 */
const render = async (): Promise<void> => {
  if (!props.content) {
    return
  }

  const options: RichTextOptions = {
    baseUrl: props.baseUrl,
    allowIframes: props.allowIframes,
    lazyImages: props.lazyImages,
    debug: props.debug,
    forceMarkdown: props.asMarkdown,
  }

  try {
    await renderContent(props.content, options)

    // Wait for DOM update
    await nextTick()

    // Highlight code blocks
    if (html.value.includes('<code')) {
      await highlightCodeBlocks()
    }

    // Set up lazy load observer
    if (props.observeLazyLoad) {
      setupLazyLoadObserver()
    }

    // Emit success event
    emit('rendered', {
      html: html.value,
      wordCount: wordCount.value,
      readingTime: readingTime.value,
    })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    emit('error', errorMessage)
  }
}

// Watch content changes and re-render
watch(
  () => props.content,
  () => {
    cleanupObservers()
    render()
  },
  { immediate: true },
)

// Watch option changes
watch(
  [() => props.allowIframes, () => props.lazyImages, () => props.baseUrl, () => props.asMarkdown],
  () => {
    cleanupObservers()
    render()
  },
)

// Lifecycle hooks
onMounted(() => {
  // Highlight on mount if content already rendered
  if (html.value && props.enableSyntaxHighlighting) {
    highlightCodeBlocks()
  }
})

onBeforeUnmount(() => {
  cleanupObservers()
})
</script>

<style scoped>
/**
 * Component-specific styles
 * Most styling is handled by Tailwind's Typography plugin
 * Using inline styles for Tailwind v4 compatibility (no @apply)
 */

.rich-text-content img {
  transition: opacity 0.3s;
}

.rich-text-content img[loading='lazy']:not([src]) {
  opacity: 0;
}

.rich-text-content img[loading='lazy'][src] {
  opacity: 1;
}

/**
 * Image responsiveness - ensure full width and proper aspect ratio
 */
.rich-text-content figure {
  width: 100%;
  max-width: 100%;
  margin-left: 0;
  margin-right: 0;
}

.rich-text-content figure img {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
}

.rich-text-content img {
  width: 100%;
  height: auto;
  max-width: 100%;
  display: block;
}

.rich-text-content pre {
  overflow-x: auto;
}

.rich-text-content .aspect-video {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.rich-text-content .aspect-video iframe {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
}

/**
 * Dark mode code blocks
 */
.dark .rich-text-content :not(pre) > code {
  background-color: rgb(var(--color-muted));
  color: rgb(var(--color-foreground));
}

.dark .rich-text-content pre {
  border: 1px solid rgb(var(--color-border));
  background-color: rgb(var(--color-card));
}

/**
 * List styling improvements
 */
.rich-text-content ul,
.rich-text-content ol {
  padding-left: 1.5rem;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.rich-text-content ul {
  list-style-type: disc;
}

.rich-text-content ol {
  list-style-type: decimal;
}

.rich-text-content ul ul,
.rich-text-content ol ul {
  list-style-type: circle;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.rich-text-content ul ul ul,
.rich-text-content ol ul ul {
  list-style-type: square;
}

.rich-text-content li {
  padding-left: 0.25rem;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

.rich-text-content li > ul,
.rich-text-content li > ol {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}

/**
 * Accessibility: Focus styles for links
 */
.rich-text-content a:focus {
  outline: 2px solid rgb(var(--color-primary));
  outline-offset: 2px;
}

/**
 * Callout styles for special blockquotes
 */
.rich-text-content .callout {
  padding: 1rem;
  border-radius: 0.5rem;
  margin: 1.5rem 0;
}

.rich-text-content .callout-note {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: rgb(59, 130, 246);
}

.rich-text-content .callout-tip {
  background-color: rgba(16, 185, 129, 0.1);
  border-color: rgb(16, 185, 129);
}

.rich-text-content .callout-important {
  background-color: rgba(139, 92, 246, 0.1);
  border-color: rgb(139, 92, 246);
}

.rich-text-content .callout-warning {
  background-color: rgba(245, 158, 11, 0.1);
  border-color: rgb(245, 158, 11);
}

.rich-text-content .callout-caution {
  background-color: rgba(239, 68, 68, 0.1);
  border-color: rgb(239, 68, 68);
}

/**
 * HTML embed elements styling
 */
.rich-text-content details {
  padding: 1rem;
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.rich-text-content summary {
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.rich-text-content mark {
  background-color: rgba(250, 204, 21, 0.3);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.rich-text-content kbd {
  background-color: rgb(var(--color-muted));
  border: 1px solid rgb(var(--color-border));
  border-radius: 0.25rem;
  padding: 0.125rem 0.5rem;
  font-family: monospace;
  font-size: 0.875rem;
  box-shadow: 0 2px 0 rgb(var(--color-border));
}

/**
 * Task list styling
 */
.rich-text-content input[type='checkbox'] {
  margin-right: 0.5rem;
  cursor: default;
}

/**
 * Print styles
 */
@media print {
  .rich-text-content img {
    max-width: 100%;
    page-break-inside: avoid;
  }

  .rich-text-content pre {
    border: 1px solid rgb(var(--color-border));
    page-break-inside: avoid;
  }

  .rich-text-content h1,
  .rich-text-content h2,
  .rich-text-content h3,
  .rich-text-content h4,
  .rich-text-content h5,
  .rich-text-content h6 {
    page-break-after: avoid;
  }
}
</style>
