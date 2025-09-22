<template>
  <section id="newsletter" class="py-16">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="rounded-2xl border border-border bg-transparent backdrop-blur-md shadow-lg p-8 sm:p-10 text-center"
        data-aos="fade-up">
        <!-- Icon -->
        <div
          class="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary/10 text-primary inline-flex items-center justify-center">
          <EnvelopeIcon class="w-8 h-8" />
        </div>

        <!-- Title -->
        <h2 class="text-3xl sm:text-4xl font-bold text-foreground mb-3">Stay Updated</h2>

        <!-- Description -->
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-8">
          Subscribe to our newsletter and never miss our latest insights, updates, and exclusive content.
        </p>

        <!-- Newsletter Form or Unsubscribe -->
        <div class="max-w-md mx-auto">
          <form v-if="!isSubscribed" @submit.prevent="subscribe" class="flex flex-col sm:flex-row gap-4">
            <div class="flex-grow">
              <label for="email" class="sr-only">Email address</label>
              <input id="email" v-model="form.email" type="email" autocomplete="email" required
                class="w-full px-6 py-3 rounded-full border border-border bg-transparent text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-transparent"
                placeholder="Enter your email" :disabled="loading" />
              <p v-if="errors.email" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.email }}
              </p>
            </div>

            <button type="submit" :disabled="loading"
              class="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="!loading">Subscribe</span>
              <span v-else class="flex items-center">
                <LoadingSpinner class="w-4 h-4 mr-2" />
                Subscribing...
              </span>
            </button>
          </form>

          <div v-else class="flex flex-col items-center gap-3">
            <p class="text-sm text-muted-foreground">You're subscribed with <strong
                class="text-foreground">{{ subscribedEmailDisplay }}</strong>.</p>
            <button @click="unsubscribe" :disabled="loading"
              class="inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-medium border border-border hover:bg-muted transition disabled:opacity-50">
              <span v-if="!loading">Unsubscribe</span>
              <span v-else class="flex items-center">
                <LoadingSpinner class="w-4 h-4 mr-2" />
                Processing...
              </span>
            </button>
          </div>
        </div>

        <!-- Success/Error Messages -->
        <div class="mt-6">
          <div v-if="successMessage"
            class="inline-flex items-center px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 text-sm border border-green-500/30"
            data-aos="fade-in">
            <CheckCircleIcon class="w-5 h-5 mr-2" />
            {{ successMessage }}
          </div>

          <div v-if="errorMessage"
            class="inline-flex items-center px-4 py-2 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 text-sm border border-red-500/30"
            data-aos="fade-in">
            <ExclamationTriangleIcon class="w-5 h-5 mr-2" />
            {{ errorMessage }}
          </div>
        </div>

        <!-- Features -->
        <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div
              class="mx-auto mb-3 w-10 h-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <BellIcon class="w-6 h-6" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-1">Weekly Updates</h3>
            <p class="text-sm text-muted-foreground">Get the latest posts delivered every week</p>
          </div>

          <div class="text-center">
            <div
              class="mx-auto mb-3 w-10 h-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <StarIcon class="w-6 h-6" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-1">Exclusive Content</h3>
            <p class="text-sm text-muted-foreground">Access subscriber-only articles and previews</p>
          </div>

          <div class="text-center">
            <div
              class="mx-auto mb-3 w-10 h-10 rounded-xl bg-primary/10 text-primary inline-flex items-center justify-center">
              <ShieldCheckIcon class="w-6 h-6" />
            </div>
            <h3 class="text-base font-semibold text-foreground mb-1">No Spam</h3>
            <p class="text-sm text-muted-foreground">Unsubscribe anytime with one click</p>
          </div>
        </div>

        <!-- Newsletter Stats -->
        <div v-if="newsletterStats.totalSubscribers > 0" class="mt-8" data-aos="fade-up" data-aos-delay="200">
          <p class="text-sm text-muted-foreground">
            Join
            <strong class="text-foreground">{{ formatNumber(newsletterStats.totalSubscribers) }}</strong>
            other subscribers
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import {
    BellIcon,
    CheckCircleIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    ShieldCheckIcon,
    StarIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, reactive, ref } from 'vue';
  import { contentService } from '../../services/content';
  import LoadingSpinner from '../ui/LoadingSpinner.vue';

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

  const isSubscribed = ref<boolean>(localStorage.getItem('newsletter-subscribed') === 'true')
  const subscribedEmail = ref<string | null>(localStorage.getItem('newsletter-email'))
  const subscribedEmailDisplay = computed(() => subscribedEmail.value || 'your email')

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
        subscription_date: new Date().toISOString(),
        subscribed: true,
        source: 'website',
      })

      successMessage.value = '🎉 Thank you for subscribing!'
      // Persist subscription state
      isSubscribed.value = true
      subscribedEmail.value = form.email
      localStorage.setItem('newsletter-subscribed', 'true')
      localStorage.setItem('newsletter-email', form.email)
      form.email = ''

      // Update stats
      loadNewsletterStats()

      // Clear success message after 5 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 5000)
    } catch (error: any) {
      console.error('Newsletter subscription error:', error)

      // Handle common Strapi validation errors (unique constraint or required field)
      const message: string | undefined = error?.response?.data?.error?.message
      if (error.response?.status === 400) {
        if (message?.toLowerCase().includes('unique')) {
          errorMessage.value = 'This email is already subscribed!'
        } else if (message?.toLowerCase().includes('email')) {
          errorMessage.value = 'Please provide a valid email address.'
        } else {
          errorMessage.value = message || 'Invalid request. Please check your input.'
        }
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

  const unsubscribe = async () => {
    clearMessages()
    if (!subscribedEmail.value) {
      errorMessage.value = 'No subscription found.'
      return
    }
    loading.value = true
    try {
      const { newsletterApi } = await import('../../services/blog')
      await newsletterApi.unsubscribe(subscribedEmail.value)
    } catch (err: any) {
      console.error('Unsubscribe failed:', err)
      errorMessage.value = err?.response?.data?.message || 'Failed to unsubscribe.'
      setTimeout(() => (errorMessage.value = ''), 5000)
      return
    } finally {
      loading.value = false
    }

    // Clear state on success
    isSubscribed.value = false
    localStorage.removeItem('newsletter-subscribed')
    localStorage.removeItem('newsletter-email')
    successMessage.value = 'You have been unsubscribed.'
    setTimeout(() => (successMessage.value = ''), 5000)
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

<style scoped></style>
