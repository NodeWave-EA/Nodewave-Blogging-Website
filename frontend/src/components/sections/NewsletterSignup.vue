<template>
  <section id="newsletter" class="py-16 relative overflow-hidden">
    <div class="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <!-- Content -->
      <div data-aos="fade-up">
        <!-- Icon -->
        <div class="flex justify-center mb-6">
          <div
            class="flex items-center justify-center w-16 h-16 bg-white/30 dark:bg-zinc-900/30 backdrop-blur-sm rounded-2xl"
          >
            <EnvelopeIcon class="w-8 h-8 text-zinc-700 dark:text-zinc-300" />
          </div>
        </div>

        <!-- Title -->
        <h2 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-4xl mb-4">
          Stay Updated
        </h2>

        <!-- Description -->
        <p class="text-xl text-zinc-600 dark:text-zinc-300 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter and never miss our latest insights, updates, and exclusive
          content.
        </p>

        <!-- Newsletter Form -->
        <div class="max-w-md mx-auto">
          <form @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-4">
            <div class="flex-grow">
              <label for="email" class="sr-only">Email address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="w-full px-6 py-3 border border-zinc-300/50 dark:border-zinc-600/50 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none"
                placeholder="Enter your email"
                :disabled="loading"
              />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.email }}
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
            >
              <span v-if="!loading">Subscribe</span>
              <span v-else class="flex items-center">
                <LoadingSpinner class="w-4 h-4 mr-2" />
                Subscribing...
              </span>
            </button>
          </form>
        </div>

        <!-- Success/Error Messages -->
        <div class="mt-6">
          <div
            v-if="successMessage"
            class="inline-flex items-center px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm text-green-700 dark:text-green-300 text-sm border border-green-500/30"
            data-aos="fade-in"
          >
            <CheckCircleIcon class="w-5 h-5 mr-2" />
            {{ successMessage }}
          </div>

          <div
            v-if="errorMessage"
            class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-sm text-red-700 dark:text-red-300 text-sm border border-red-500/30"
            data-aos="fade-in"
          >
            <ExclamationTriangleIcon class="w-5 h-5 mr-2" />
            {{ errorMessage }}
          </div>
        </div>

        <!-- Features -->
        <div
          class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div class="text-center">
            <div class="flex justify-center mb-3">
              <BellIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Weekly Updates
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              Get the latest posts delivered to your inbox every week
            </p>
          </div>

          <div class="text-center">
            <div class="flex justify-center mb-3">
              <StarIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Exclusive Content
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              Access subscriber-only articles and early previews
            </p>
          </div>

          <div class="text-center">
            <div class="flex justify-center mb-3">
              <ShieldCheckIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 class="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No Spam</h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              We respect your inbox. Unsubscribe anytime with one click
            </p>
          </div>
        </div>

        <!-- Newsletter Stats -->
        <div
          v-if="newsletterStats.totalSubscribers > 0"
          class="mt-8 text-center"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <p class="text-zinc-600 dark:text-zinc-300 text-sm">
            Join
            <strong class="text-zinc-900 dark:text-zinc-100">{{
              formatNumber(newsletterStats.totalSubscribers)
            }}</strong>
            other subscribers
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  StarIcon,
  ShieldCheckIcon,
} from '@heroicons/vue/24/outline'
import { contentService } from '../../services/content'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

// Form state
const form = reactive({
  email: '',
})

const errors = reactive({
  email: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const newsletterStats = ref({
  totalSubscribers: 0,
})

// Email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Format number with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num)
}

// Clear messages
const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
  errors.email = ''
}

// Subscribe function
const subscribe = async () => {
  clearMessages()

  // Validation
  if (!form.email) {
    errors.email = 'Email is required'
    return
  }

  if (!isValidEmail(form.email)) {
    errors.email = 'Please enter a valid email address'
    return
  }

  loading.value = true

  try {
    await contentService.subscribeToNewsletter({
      email: form.email,
      subscribed_at: new Date().toISOString(),
      status: 'active',
    })

    successMessage.value = '🎉 Thank you for subscribing! Check your email to confirm.'
    form.email = ''

    // Update stats
    loadNewsletterStats()

    // Clear success message after 5 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error: any) {
    console.error('Newsletter subscription error:', error)

    if (
      error.response?.status === 400 &&
      error.response?.data?.error?.message?.includes('unique')
    ) {
      errorMessage.value = 'This email is already subscribed!'
    } else {
      errorMessage.value = 'Something went wrong. Please try again later.'
    }

    // Clear error message after 5 seconds
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  } finally {
    loading.value = false
  }
}

// Load newsletter stats
const loadNewsletterStats = async () => {
  try {
    const response = await contentService.getNewsletterSubscribers({
      pagination: { page: 1, pageSize: 1 },
    })

    newsletterStats.value.totalSubscribers = response.meta?.pagination?.total || 0
  } catch (error) {
    console.error('Failed to load newsletter stats:', error)
  }
}

onMounted(() => {
  loadNewsletterStats()
})
</script>

<style scoped>
/* Custom animations for newsletter section */
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }

  100% {
    transform: translateY(0px);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Gradient animation */
@keyframes gradient-shift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

section {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}
</style>
