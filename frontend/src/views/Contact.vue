<template>
  <div class="min-h-screen py-8">
    <!-- Hero Section -->
    <div class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl py-16 mb-8">
      <div class="container mx-auto px-4 max-w-4xl text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6">
          Contact Us
        </h1>
        <p class="text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed">
          We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>
    </div>

    <!-- Contact Content -->
    <div class="container mx-auto px-4 max-w-6xl">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <!-- Contact Information -->
        <div>
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Get in Touch</h2>
          <p class="text-zinc-600 dark:text-zinc-300 mb-8">
            Have a question, suggestion, or just want to say hello? We're here to help.
          </p>

          <!-- Contact Details -->
          <div class="space-y-6">
            <!-- Email -->
            <div v-if="companyInfo?.contact_email" class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <EnvelopeIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold text-zinc-900 dark:text-white mb-1">Email</h3>
                <a
                  :href="`mailto:${companyInfo.contact_email}`"
                  class="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {{ companyInfo.contact_email }}
                </a>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Send us an email anytime
                </p>
              </div>
            </div>

            <!-- Phone -->
            <div v-if="companyInfo?.contact_phone" class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <PhoneIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 class="font-semibold text-zinc-900 dark:text-white mb-1">Phone</h3>
                <a
                  :href="`tel:${companyInfo.contact_phone}`"
                  class="text-green-600 dark:text-green-400 hover:underline"
                >
                  {{ companyInfo.contact_phone }}
                </a>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  Call us during business hours
                </p>
              </div>
            </div>

            <!-- Address -->
            <div v-if="companyInfo?.address" class="flex items-start space-x-4">
              <div
                class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0"
              >
                <MapPinIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 class="font-semibold text-zinc-900 dark:text-white mb-1">Address</h3>
                <p class="text-zinc-600 dark:text-zinc-300">{{ companyInfo.address }}</p>
                <p class="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Visit us in person</p>
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div v-if="companyInfo?.social_links?.length" class="mt-8">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-4">Follow Us</h3>
            <div class="flex space-x-4">
              <a
                v-for="social in companyInfo.social_links"
                :key="social.platform"
                :href="social.url"
                target="_blank"
                rel="noopener noreferrer"
                class="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                :title="social.platform"
              >
                <GlobeAltIcon class="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <!-- Contact Form -->
        <div
          class="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-200 dark:border-zinc-700"
        >
          <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-6">Send us a Message</h2>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Name -->
            <div>
              <label
                for="name"
                class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Name *
              </label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Your full name"
              />
            </div>

            <!-- Email -->
            <div>
              <label
                for="email"
                class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <!-- Subject -->
            <div>
              <label
                for="subject"
                class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Subject *
              </label>
              <input
                id="subject"
                v-model="form.subject"
                type="text"
                required
                class="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="What's this about?"
              />
            </div>

            <!-- Message -->
            <div>
              <label
                for="message"
                class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                v-model="form.message"
                rows="5"
                required
                class="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us what you'd like to discuss..."
              ></textarea>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting" class="flex items-center justify-center">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
              <span v-else>Send Message</span>
            </button>
          </form>

          <!-- Success Message -->
          <div
            v-if="showSuccess"
            class="mt-6 p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg"
          >
            <div class="flex items-center">
              <CheckCircleIcon class="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <p class="text-green-800 dark:text-green-200">
                Thank you for your message! We'll get back to you soon.
              </p>
            </div>
          </div>

          <!-- Error Message -->
          <div
            v-if="error"
            class="mt-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg"
          >
            <div class="flex items-center">
              <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
              <p class="text-red-800 dark:text-red-200">
                {{ error }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="mt-16">
        <h2 class="text-2xl font-bold text-zinc-900 dark:text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-2">
              How quickly do you respond?
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              We typically respond to messages within 24 hours during business days.
            </p>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-2">
              Can I suggest blog topics?
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              Absolutely! We love hearing content ideas from our readers.
            </p>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-2">
              Do you accept guest posts?
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              We consider guest contributions. Please include details about your proposed topic.
            </p>
          </div>
          <div class="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
            <h3 class="font-semibold text-zinc-900 dark:text-white mb-2">
              Can I subscribe to updates?
            </h3>
            <p class="text-zinc-600 dark:text-zinc-300 text-sm">
              Yes! You can subscribe to our newsletter to stay updated with latest posts.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'
import { useCompanyInfo } from '@/composables/useCompanyInfo'
import { updateSEO } from '@/utils/seo'
import type { ContactForm } from '@/types'

// Composables
const { companyInfo, fetchCompanyInfo } = useCompanyInfo()

// Reactive data
const form = reactive<ContactForm>({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)
const showSuccess = ref(false)
const error = ref<string | null>(null)

// Methods
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = null

    // For now, just simulate a successful submission
    // In a real app, you'd send this to your backend or email service
    await new Promise((resolve) => setTimeout(resolve, 1000))

    showSuccess.value = true

    // Reset form
    Object.assign(form, {
      name: '',
      email: '',
      subject: '',
      message: '',
    })

    // Hide success message after 5 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 5000)
  } catch (err) {
    console.error('Failed to send message:', err)
    error.value = 'Failed to send message. Please try again or contact us directly.'
  } finally {
    isSubmitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Update SEO
  updateSEO({
    title: 'Contact Us',
    description: "Get in touch with us. We'd love to hear from you.",
    type: 'website',
  })

  // Fetch company info
  await fetchCompanyInfo()
})
</script>
