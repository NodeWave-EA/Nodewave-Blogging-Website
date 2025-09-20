<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="closePopup"
      >
        <div
          class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 relative"
          @click.stop
        >
          <button
            @click="closePopup"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Close newsletter popup"
            type="button"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div class="text-center mb-6">
            <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Stay Updated!</h3>
            <p class="text-gray-600 dark:text-gray-300">
              Subscribe to our newsletter and get the latest blog posts delivered straight to your
              inbox.
            </p>
          </div>

          <NewsletterForm @success="handleSuccess" @error="handleError" />

          <div class="mt-4 text-center">
            <button
              @click="closePopup"
              class="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              type="button"
            >
              No thanks, maybe later
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import NewsletterForm from './NewsletterForm.vue'

interface NewsletterPopupProps {
  delayMs?: number
  showOnScroll?: boolean
  scrollThreshold?: number
}

const props = withDefaults(defineProps<NewsletterPopupProps>(), {
  delayMs: 5000,
  showOnScroll: true,
  scrollThreshold: 50,
})

const emit = defineEmits<{
  success: [email: string]
  error: [message: string]
  close: []
}>()

const isVisible = ref<boolean>(false)
const hasShown = ref<boolean>(false)

const closePopup = (): void => {
  isVisible.value = false
  emit('close')
  // Remember that user closed the popup
  localStorage.setItem('newsletter-popup-closed', Date.now().toString())
}

const handleSuccess = (email: string): void => {
  emit('success', email)
  closePopup()
}

const handleError = (message: string): void => {
  emit('error', message)
}

const shouldShowPopup = (): boolean => {
  // Don't show if already shown in this session
  if (hasShown.value) return false

  // Check if user closed it recently (within 7 days)
  const lastClosed = localStorage.getItem('newsletter-popup-closed')
  if (lastClosed) {
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    if (parseInt(lastClosed) > sevenDaysAgo) return false
  }

  // Check if user is already subscribed
  const isSubscribed = localStorage.getItem('newsletter-subscribed')
  if (isSubscribed === 'true') return false

  return true
}

const showPopup = (): void => {
  if (shouldShowPopup()) {
    isVisible.value = true
    hasShown.value = true
  }
}

const handleScroll = (): void => {
  if (!props.showOnScroll || hasShown.value) return

  const scrollPercent =
    (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
  if (scrollPercent >= props.scrollThreshold) {
    showPopup()
  }
}

onMounted(() => {
  // Show popup after delay if enabled
  if (props.delayMs > 0) {
    setTimeout(showPopup, props.delayMs)
  }

  // Show popup on scroll if enabled
  if (props.showOnScroll) {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (props.showOnScroll) {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>
