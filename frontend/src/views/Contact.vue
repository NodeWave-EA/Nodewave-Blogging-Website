<template>
  <div class="min-h-screen py-8 bg-transparent">
    <!-- Loading State: show full-page skeleton while initial API request is pending -->
    <ContactPageSkeleton v-if="loadingCompanyInfo" />

    <!-- Contact Content (show form even if company info failed to load) -->
    <div v-else class="py-8">
      <!-- Page Header -->
      <PageHeader tag="Contact" title="Contact Us"
        description="We'd love to hear from you. Send us a message and we'll respond as soon as possible."
        size="regular" />
      <div class="container mx-auto px-4 max-w-6xl">
        <div
          :class="['grid', 'grid-cols-1', hasCompanyInfo ? 'lg:grid-cols-2' : 'lg:grid-cols-1', 'gap-12', !hasCompanyInfo ? 'justify-items-center' : '']">
          <!-- Contact Information (only shown when company info retrieved) -->
          <div v-if="hasCompanyInfo">
            <h2 class="text-2xl font-bold font-mono text-foreground mb-6">Get in Touch</h2>
            <p class="text-muted-foreground mb-8 font-mono">
              Have a question, suggestion, or just want to say hello? We're here to help.
            </p>

            <!-- Contact Details -->
            <div class="space-y-6">
              <!-- Email -->
              <div v-if="companyInfo?.contact_email" class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-border bg-transparent">
                  <EnvelopeIcon class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold font-mono text-foreground mb-1">Email</h3>
                  <a :href="`mailto:${companyInfo.contact_email}`" class="text-primary hover:underline font-mono">
                    {{ companyInfo.contact_email }}
                  </a>
                  <p class="text-sm text-muted-foreground mt-1 font-mono">Send us an email anytime</p>
                </div>
              </div>

              <!-- Phone -->
              <div v-if="companyInfo?.contact_phone" class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-border bg-transparent">
                  <PhoneIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 class="font-semibold font-mono text-foreground mb-1">Phone</h3>
                  <a :href="`tel:${companyInfo.contact_phone}`"
                    class="text-green-600 dark:text-green-400 hover:underline font-mono">
                    {{ companyInfo.contact_phone }}
                  </a>
                  <p class="text-sm text-muted-foreground mt-1 font-mono">
                    Call us during business hours
                  </p>
                </div>
              </div>

              <!-- Address -->
              <div v-if="companyInfo?.address" class="flex items-start gap-4">
                <div
                  class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-border bg-transparent">
                  <MapPinIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 class="font-semibold font-mono text-foreground mb-1">Address</h3>
                  <p class="text-foreground font-mono">{{ companyInfo.address }}</p>
                  <p class="text-sm text-muted-foreground mt-1 font-mono">Visit us in person</p>
                </div>
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="companyInfo?.social_links?.length" class="mt-8">
              <h3 class="font-semibold font-mono text-foreground mb-4">Follow Us</h3>
              <div class="flex space-x-4">
                <a v-for="social in companyInfo.social_links" :key="social.platform" :href="social.url" target="_blank"
                  rel="noopener noreferrer"
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground border border-border hover:bg-muted hover:text-primary transition-colors"
                  :title="social.platform">
                  <GlobeAltIcon class="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div
            :class="['bg-transparent rounded-xl p-8 border border-border shadow-md w-full', !hasCompanyInfo ? 'mx-auto max-w-xl' : '']">
            <h2 class="text-2xl font-bold font-mono text-foreground mb-6">Send us a Message</h2>

            <form @submit.prevent="handleSubmit" class="space-y-6">
              <!-- Name -->
              <div>
                <label for="name" class="block text-sm font-medium font-mono text-foreground mb-2">
                  Name *
                </label>
                <input id="name" v-model="form.name" type="text" required
                  class="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-mono"
                  placeholder="Your full name" />
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium font-mono text-foreground mb-2">
                  Email *
                </label>
                <input id="email" v-model="form.email" type="email" required
                  class="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-mono"
                  placeholder="your.email@example.com" />
              </div>

              <!-- Subject -->
              <div>
                <label for="subject" class="block text-sm font-medium font-mono text-foreground mb-2">
                  Subject *
                </label>
                <input id="subject" v-model="form.subject" type="text" required
                  class="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-mono"
                  placeholder="What's this about?" />
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium font-mono text-foreground mb-2">
                  Message *
                </label>
                <textarea id="message" v-model="form.message" rows="5" required
                  class="w-full px-4 py-3 border border-border rounded-lg bg-transparent text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none font-mono"
                  placeholder="Tell us what you'd like to discuss..."></textarea>
              </div>

              <!-- Submit Button -->
              <button type="submit" :disabled="isSubmitting"
                class="w-full px-6 py-3 bg-primary text-primary-foreground font-semibold font-mono rounded-lg hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
                <span v-if="isSubmitting" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </span>
                <span v-else>Send Message</span>
              </button>
            </form>

            <!-- Success Message -->
            <div v-if="showSuccess"
              class="mt-6 p-4 bg-transparent border border-green-500 dark:border-green-400 rounded-lg">
              <div class="flex items-start">
                <CheckCircleIcon class="w-5 h-5 text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p class="text-green-700 dark:text-green-300 font-mono font-semibold mb-2">
                    Thank you for your message! We'll get back to you soon.
                  </p>
                </div>
              </div>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="mt-6 p-4 bg-transparent border border-red-500 dark:border-red-400 rounded-lg">
              <div class="flex items-center">
                <ExclamationTriangleIcon class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <p class="text-red-700 dark:text-red-300 font-mono">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="mt-16">
      <h2 class="text-2xl font-bold font-mono text-foreground mb-8 text-center">
        Frequently Asked Questions
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div class="rounded-lg p-6 border border-border bg-transparent">
          <h3 class="font-semibold font-mono text-foreground mb-2">
            How quickly do you respond?
          </h3>
          <p class="text-muted-foreground text-sm font-mono">
            We typically respond to messages within 24 hours during business days.
          </p>
        </div>
        <div class="rounded-lg p-6 border border-border bg-transparent">
          <h3 class="font-semibold font-mono text-foreground mb-2">Can I suggest blog topics?</h3>
          <p class="text-muted-foreground text-sm font-mono">
            Absolutely! We love hearing content ideas from our readers.
          </p>
        </div>
        <div class="rounded-lg p-6 border border-border bg-transparent">
          <h3 class="font-semibold font-mono text-foreground mb-2">Do you accept guest posts?</h3>
          <p class="text-muted-foreground text-sm font-mono">
            We consider guest contributions. Please include details about your proposed topic.
          </p>
        </div>
        <div class="rounded-lg p-6 border border-border bg-transparent">
          <h3 class="font-semibold font-mono text-foreground mb-2">
            Can I subscribe to updates?
          </h3>
          <p class="text-muted-foreground text-sm font-mono">
            Yes! You can subscribe to our newsletter to stay updated with latest posts.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import ContactPageSkeleton from '@/components/contact/ContactPageSkeleton.vue';
  import PageHeader from '@/components/ui/PageHeader.vue';
  import { useCompanyInfo } from '@/composables/useCompanyInfo';
  import { contactService } from '@/services';
  import type { ContactForm } from '@/types';
  import { updateSEO } from '@/utils/seo';
  import {
    CheckCircleIcon,
    EnvelopeIcon,
    ExclamationTriangleIcon,
    GlobeAltIcon,
    MapPinIcon,
    PhoneIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, reactive, ref } from 'vue';

  const { companyInfo, fetchCompanyInfo, loading: loadingCompanyInfo } = useCompanyInfo()
  const hasCompanyInfo = computed(() => Boolean(companyInfo && (companyInfo as any).value))

  const form = reactive<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const isSubmitting = ref(false)
  const showSuccess = ref(false)
  const error = ref<string | null>(null)
  const successDetails = ref<{ adminNotificationSent: boolean; autoReplySent: boolean } | null>(null)

  const handleSubmit = async () => {
    try {
      isSubmitting.value = true
      error.value = null
      showSuccess.value = false

      // Submit form to backend API
      const response = await contactService.submitContactForm(form)

      if (response.success) {
        showSuccess.value = true
        successDetails.value = response.data

        // Reset form
        Object.assign(form, {
          name: '',
          email: '',
          subject: '',
          message: '',
        })

        // Hide success message after 10 seconds
        setTimeout(() => {
          showSuccess.value = false
          successDetails.value = null
        }, 10000)
      } else {
        throw new Error(response.message || 'Failed to send message')
      }
    } catch (err: any) {
      console.error('Failed to send message:', err)
      error.value = err.message || 'Failed to send message. Please try again or contact us directly.'

      // Hide error message after 8 seconds
      setTimeout(() => {
        error.value = null
      }, 8000)
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

    // Fetch company info via the shared composable
    await fetchCompanyInfo()
  })
</script>
