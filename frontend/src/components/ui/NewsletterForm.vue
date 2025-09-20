<template>
  <form @submit.prevent="handleSubmit" class="newsletter-form">
    <!-- Email Input -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="flex-1">
        <label for="newsletter-email" class="sr-only">Email address</label>
        <input
          id="newsletter-email"
          v-model="form.email"
          type="email"
          required
          placeholder="Enter your email address"
          class="w-full px-4 py-3 text-sm border border-zinc-300/50 dark:border-zinc-600/50 rounded-lg bg-white/80 dark:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 backdrop-blur-sm transition-colors duration-200"
          :class="{ 'border-red-500 focus:ring-red-500': error }"
          :disabled="loading"
        />
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading || !form.email"
        class="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-zinc-800 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        :class="{
          'cursor-wait': loading,
          'hover:shadow-lg transform hover:scale-105': !loading && form.email,
        }"
      >
        <span v-if="loading" class="flex items-center">
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Subscribing...
        </span>
        <span v-else-if="variant === 'footer'">Subscribe</span>
        <span v-else>Join Newsletter</span>
      </button>
    </div>

    <!-- Privacy Notice (for main form variant) -->
    <div v-if="variant === 'main'" class="mt-3">
      <p class="text-xs text-zinc-500 dark:text-zinc-400">
        By subscribing, you agree to our
        <router-link to="/privacy" class="text-blue-600 dark:text-blue-400 hover:underline">
          Privacy Policy
        </router-link>
        and consent to receive updates from our team.
      </p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
      {{ error }}
    </div>

    <!-- Success Message -->
    <div v-if="success" class="mt-3 text-sm text-green-600 dark:text-green-400" role="alert">
      {{ successMessage }}
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { newsletterApi } from '@/services/blog'
import type { NewsletterForm as NewsletterFormData } from '@/types'

interface Props {
  variant?: 'main' | 'footer' | 'modal'
  placeholder?: string
  buttonText?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'main',
  placeholder: 'Enter your email address',
  buttonText: 'Subscribe',
})

const emit = defineEmits<{
  success: [email: string]
  error: [error: string]
}>()

// Form state
const form = reactive<NewsletterFormData>({
  email: '',
  preferences: {
    frequency: 'weekly',
  },
})

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const formSource = ref<string>('website')

const successMessage = computed(() => {
  return 'Thank you for subscribing! Please check your email to confirm your subscription.'
})

// Form validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validateForm = (): boolean => {
  error.value = null

  if (!form.email) {
    error.value = 'Email address is required'
    return false
  }

  if (!isValidEmail(form.email)) {
    error.value = 'Please enter a valid email address'
    return false
  }

  return true
}

// Form submission
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    error.value = null
    success.value = false

    // Set source based on variant
    if (props.variant === 'footer') {
      formSource.value = 'footer'
    } else if (props.variant === 'modal') {
      formSource.value = 'modal'
    }

    await newsletterApi.subscribe(form)

    success.value = true
    emit('success', form.email)

    // Reset form
    form.email = ''

    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      success.value = false
    }, 5000)
  } catch (err: any) {
    console.error('Newsletter subscription failed:', err)

    // Handle specific error cases
    if (err.response?.status === 409) {
      error.value = 'This email address is already subscribed to our newsletter.'
    } else if (err.response?.status === 400) {
      error.value = err.response.data?.message || 'Please check your email address and try again.'
    } else {
      error.value = 'Something went wrong. Please try again later.'
    }

    if (error.value) {
      emit('error', error.value)
    }
  } finally {
    loading.value = false
  }
}

// Expose methods for parent components
defineExpose({
  reset: () => {
    form.email = ''
    error.value = null
    success.value = false
    loading.value = false
  },
  submit: handleSubmit,
})
</script>

<style scoped>
/* Loading spinner animation */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus styles for better accessibility */
input:focus {
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.5);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .newsletter-form button {
    width: 100%;
  }
}
</style>
