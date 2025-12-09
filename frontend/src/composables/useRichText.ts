/**
 * useRichText Composable
 *
 * Vue 3 composable for rendering rich text content reactively.
 * Provides reactive state management for rich text rendering with error handling.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * import { useRichText } from '@/composables/useRichText'
 *
 * const { html, error, isLoading, renderContent, refresh } = useRichText()
 *
 * // Render content
 * await renderContent(strapiContent, { allowIframes: true })
 * </script>
 *
 * <template>
 *   <div v-if="isLoading">Loading...</div>
 *   <div v-else-if="error">{{ error }}</div>
 *   <div v-else v-html="html" class="prose"></div>
 * </template>
 * ```
 */

import { ref, computed, watch, type Ref } from 'vue'
import { renderRichText, validateRichTextContent } from '@/utils/richTextRenderer'
import type { RichTextOptions, RichTextResult } from '@/types/RichText'

export interface UseRichTextReturn {
  /** Rendered HTML (sanitized and safe) */
  html: Ref<string>

  /** Plain text content without HTML tags */
  textContent: Ref<string>

  /** Number of words in the content */
  wordCount: Ref<number>

  /** Estimated reading time in minutes */
  readingTime: Ref<number>

  /** Whether content was sanitized (had unsafe elements removed) */
  wasSanitized: Ref<boolean>

  /** Current error message if rendering failed */
  error: Ref<string | null>

  /** Whether content is currently being rendered */
  isLoading: Ref<boolean>

  /** The complete result object */
  result: Ref<RichTextResult | null>

  /** Render new content */
  renderContent: (content: string, options?: RichTextOptions) => Promise<void>

  /** Re-render current content with new options */
  refresh: (newOptions?: RichTextOptions) => Promise<void>

  /** Clear all content and reset state */
  clear: () => void

  /** Validate content for security issues before rendering */
  validate: (content: string) => { isValid: boolean; warnings: string[] }
}

/**
 * Composable for rendering rich text content with reactive state
 *
 * @param initialContent - Optional initial content to render
 * @param initialOptions - Optional initial rendering options
 * @returns Reactive rich text rendering utilities
 */
export function useRichText(
  initialContent?: string,
  initialOptions?: RichTextOptions,
): UseRichTextReturn {
  // Reactive state
  const html = ref<string>('')
  const textContent = ref<string>('')
  const wordCount = ref<number>(0)
  const readingTime = ref<number>(0)
  const wasSanitized = ref<boolean>(false)
  const error = ref<string | null>(null)
  const isLoading = ref<boolean>(false)
  const result = ref<RichTextResult | null>(null)

  // Store current content and options for refresh
  const currentContent = ref<string>(initialContent || '')
  const currentOptions = ref<RichTextOptions>(initialOptions || {})

  /**
   * Render content and update reactive state
   */
  const renderContent = async (content: string, options: RichTextOptions = {}): Promise<void> => {
    // Validate input
    if (!content || typeof content !== 'string') {
      clear()
      return
    }

    isLoading.value = true
    error.value = null

    try {
      // Store for potential refresh
      currentContent.value = content
      currentOptions.value = options

      // Render in next tick to avoid blocking UI
      await new Promise((resolve) => setTimeout(resolve, 0))

      const renderResult = renderRichText(content, options)

      // Update reactive state
      result.value = renderResult
      html.value = renderResult.html
      textContent.value = renderResult.textContent
      wordCount.value = renderResult.wordCount
      readingTime.value = renderResult.readingTime
      wasSanitized.value = renderResult.wasSanitized
    } catch (err) {
      console.error('[useRichText] Rendering error:', err)
      error.value = err instanceof Error ? err.message : 'Failed to render content'

      // Set safe fallback
      html.value = '<p class="text-destructive">Error rendering content</p>'
      textContent.value = ''
      wordCount.value = 0
      readingTime.value = 0
      wasSanitized.value = true
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Re-render current content with updated options
   */
  const refresh = async (newOptions?: RichTextOptions): Promise<void> => {
    const options = newOptions || currentOptions.value
    await renderContent(currentContent.value, options)
  }

  /**
   * Clear all content and reset state
   */
  const clear = (): void => {
    html.value = ''
    textContent.value = ''
    wordCount.value = 0
    readingTime.value = 0
    wasSanitized.value = false
    error.value = null
    isLoading.value = false
    result.value = null
    currentContent.value = ''
    currentOptions.value = {}
  }

  /**
   * Validate content for security issues
   */
  const validate = (content: string) => {
    return validateRichTextContent(content)
  }

  // Render initial content if provided
  if (initialContent) {
    renderContent(initialContent, initialOptions)
  }

  return {
    html,
    textContent,
    wordCount,
    readingTime,
    wasSanitized,
    error,
    isLoading,
    result,
    renderContent,
    refresh,
    clear,
    validate,
  }
}

/**
 * Composable for batch rendering multiple rich text contents
 * Useful for rendering lists of blog posts, comments, etc.
 */
export function useRichTextBatch() {
  const items = ref<Map<string | number, RichTextResult>>(new Map())
  const isLoading = ref<boolean>(false)
  const errors = ref<Map<string | number, string>>(new Map())

  const renderBatch = async (
    contents: Array<{ id: string | number; content: string }>,
    options: RichTextOptions = {},
  ): Promise<void> => {
    isLoading.value = true
    errors.value.clear()

    try {
      await Promise.all(
        contents.map(async ({ id, content }) => {
          try {
            const result = renderRichText(content, options)
            items.value.set(id, result)
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Rendering failed'
            errors.value.set(id, errorMessage)
            console.error(`[useRichTextBatch] Error rendering item ${id}:`, err)
          }
        }),
      )
    } finally {
      isLoading.value = false
    }
  }

  const getItem = (id: string | number): RichTextResult | undefined => {
    return items.value.get(id)
  }

  const getError = (id: string | number): string | undefined => {
    return errors.value.get(id)
  }

  const clearBatch = (): void => {
    items.value.clear()
    errors.value.clear()
    isLoading.value = false
  }

  return {
    items: computed(() => items.value),
    isLoading,
    errors: computed(() => errors.value),
    renderBatch,
    getItem,
    getError,
    clearBatch,
  }
}

/**
 * Composable for watching and auto-rendering reactive content
 * Automatically re-renders when content changes
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const post = ref({ content: '# Hello' })
 * const { html } = useRichTextWatch(() => post.value.content, { lazyImages: true })
 * </script>
 * ```
 */
export function useRichTextWatch(contentGetter: () => string, options: RichTextOptions = {}) {
  const richText = useRichText()

  // Watch the content getter and re-render on changes
  watch(
    contentGetter,
    async (newContent) => {
      if (newContent) {
        await richText.renderContent(newContent, options)
      } else {
        richText.clear()
      }
    },
    { immediate: true },
  )

  return richText
}

/**
 * Helper to create a debounced rich text renderer
 * Useful for live preview in editors
 */
export function useRichTextDebounced(debounceMs: number = 300) {
  const richText = useRichText()
  let timeoutId: number | null = null

  const renderContentDebounced = (content: string, options: RichTextOptions = {}): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      richText.renderContent(content, options)
      timeoutId = null
    }, debounceMs)
  }

  const cancelDebounce = (): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return {
    ...richText,
    renderContentDebounced,
    cancelDebounce,
  }
}
