<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isVisible"
        class="fixed inset-0 bg-transparent backdrop-blur-sm md:backdrop-blur-md flex items-center justify-center z-50 p-4"
        @click="closePopup">
        <div role="dialog" aria-modal="true"
          class="relative max-w-md w-full p-6 sm:p-8 rounded-2xl border border-border bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md shadow-2xl"
          @click.stop>
          <button @click="closePopup"
            class="absolute top-4 right-4 inline-flex items-center justify-center w-9 h-9 rounded-full bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition"
            aria-label="Close newsletter popup" type="button">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div class="text-center mb-6">
            <div
              class="mx-auto mb-4 w-12 h-12 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-foreground mb-2">Stay Updated</h3>
            <p class="text-muted-foreground">
              Subscribe to our newsletter and get the latest posts delivered to your inbox.
            </p>
          </div>

          <div v-if="!isSubscribed">
            <NewsletterForm @success="handleSuccess" @error="handleError" variant="modal" />
          </div>
          <div v-else class="text-center">
            <p class="text-sm text-muted-foreground mb-4">
              You're already subscribed with
              <strong class="text-foreground">{{ subscribedEmailDisplay }}</strong>.
            </p>
            <button @click="unsubscribe" :disabled="loading"
              class="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium border border-border hover:bg-muted transition disabled:opacity-50">
              <span v-if="!loading">Unsubscribe</span>
              <span v-else>Processing...</span>
            </button>
          </div>

          <div class="mt-4 text-center">
            <button @click="closePopup" class="text-sm text-muted-foreground hover:text-foreground transition-colors"
              type="button">
              No thanks, maybe later
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue';
  import NewsletterForm from './NewsletterForm.vue';

  interface NewsletterPopupProps {
    delayMs?: number
    showOnScroll?: boolean
    scrollThreshold?: number
    openOnMount?: boolean
  }

  const props = withDefaults(defineProps<NewsletterPopupProps>(), {
    delayMs: 5000,
    showOnScroll: true,
    scrollThreshold: 50,
    openOnMount: false,
  })

  const emit = defineEmits<{
    success: [email: string]
    error: [message: string]
    close: []
  }>()

  const isVisible = ref<boolean>(false)
  const loading = ref<boolean>(false)
  const hasShown = ref<boolean>(false)
  const isSubscribed = ref<boolean>(localStorage.getItem('newsletter-subscribed') === 'true')
  const subscribedEmail = ref<string | null>(localStorage.getItem('newsletter-email'))
  const subscribedEmailDisplay = computed(() => subscribedEmail.value || 'your email')

  const closePopup = (): void => {
    isVisible.value = false
    emit('close')
    localStorage.setItem('newsletter-popup-closed', Date.now().toString())
  }

  const handleSuccess = (email: string): void => {
    emit('success', email)
    // Persist subscription state and hide form in popup
    isSubscribed.value = true
    subscribedEmail.value = email
    localStorage.setItem('newsletter-subscribed', 'true')
    localStorage.setItem('newsletter-email', email)
    closePopup()
  }

  const handleError = (message: string): void => {
    emit('error', message)
  }

  const shouldShowPopup = (): boolean => {
    if (hasShown.value) return false
    const lastClosed = localStorage.getItem('newsletter-popup-closed')
    if (lastClosed) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      if (parseInt(lastClosed) > sevenDaysAgo) return false
    }
    const isSubscribed = localStorage.getItem('newsletter-subscribed')
    if (isSubscribed === 'true') return false
    return true
  }

  const unsubscribe = async (): Promise<void> => {
    if (!subscribedEmail.value) return
    loading.value = true
    try {
      const { newsletterApi } = await import('../../services/blog')
      await newsletterApi.unsubscribe(subscribedEmail.value)
      // Clear subscription state
      isSubscribed.value = false
      subscribedEmail.value = null
      localStorage.removeItem('newsletter-subscribed')
      localStorage.removeItem('newsletter-email')
    } catch (e) {
      // swallow errors; user can retry
    } finally {
      loading.value = false
    }
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
    if (props.openOnMount) {
      isVisible.value = true
      hasShown.value = true
      return
    }

    if (props.delayMs > 0) {
      setTimeout(showPopup, props.delayMs)
    }

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
