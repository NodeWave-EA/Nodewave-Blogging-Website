<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" :class="backdropClass" @click="handleBackdropClick">
        <div class="min-h-screen px-4 text-center flex items-center justify-center">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />

          <!-- Modal -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4" enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4">
            <div v-if="isOpen"
              class="relative inline-block w-full text-left align-middle transition-all transform bg-transparent border border-black/10 dark:border-white/10 backdrop-blur-xl shadow-xl"
              :class="[modalSizeClass, modalClass]" @click.stop>
              <!-- Header -->
              <div v-if="showHeader"
                class="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10"
                :class="headerClass">
                <div class="flex items-center space-x-3">
                  <!-- Icon -->
                  <div v-if="icon" class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg"
                    :class="iconClass">
                    <component :is="icon" class="w-6 h-6" />
                  </div>

                  <!-- Title -->
                  <div>
                    <h3 v-if="title" class="text-lg font-semibold text-black dark:text-white">
                      {{ title }}
                    </h3>
                    <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {{ subtitle }}
                    </p>
                  </div>
                </div>

                <!-- Close Button -->
                <button v-if="showCloseButton" @click="close"
                  class="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                  :aria-label="closeAriaLabel">
                  <XMarkIcon class="w-5 h-5" />
                </button>
              </div>

              <!-- Content -->
              <div class="relative" :class="contentClass">
                <slot />
              </div>

              <!-- Footer -->
              <div v-if="$slots.footer || showDefaultFooter"
                class="flex items-center justify-end space-x-3 px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-black/10 dark:border-white/10 backdrop-blur-sm"
                :class="footerClass">
                <slot name="footer">
                  <template v-if="showDefaultFooter">
                    <button v-if="showCancelButton" @click="cancel"
                      class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors backdrop-blur-sm"
                      :disabled="loading">
                      {{ cancelText }}
                    </button>
                    <button v-if="showConfirmButton" @click="confirm"
                      class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      :disabled="loading || confirmDisabled" :class="confirmButtonClass">
                      <LoadingSpinner v-if="loading" class="w-4 h-4 mr-2" />
                      {{ confirmText }}
                    </button>
                  </template>
                </slot>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
  import { XMarkIcon } from '@heroicons/vue/24/outline'
  import { computed, onMounted, onUnmounted, watch } from 'vue'
  import LoadingSpinner from './LoadingSpinner.vue'

  interface Props {
    modelValue: boolean
    title?: string
    subtitle?: string
    icon?: any
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    showHeader?: boolean
    showCloseButton?: boolean
    showDefaultFooter?: boolean
    showCancelButton?: boolean
    showConfirmButton?: boolean
    cancelText?: string
    confirmText?: string
    confirmDisabled?: boolean
    loading?: boolean
    persistent?: boolean
    closeOnEscape?: boolean
    closeAriaLabel?: string
    modalClass?: string
    headerClass?: string
    contentClass?: string
    footerClass?: string
    backdropClass?: string
    iconClass?: string
    confirmButtonClass?: string
  }

  interface Emits {
    (e: 'update:modelValue', value: boolean): void
    (e: 'close'): void
    (e: 'cancel'): void
    (e: 'confirm'): void
    (e: 'opened'): void
    (e: 'closed'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    modelValue: false,
    title: '',
    subtitle: '',
    size: 'md',
    showHeader: true,
    showCloseButton: true,
    showDefaultFooter: false,
    showCancelButton: true,
    showConfirmButton: true,
    cancelText: 'Cancel',
    confirmText: 'Confirm',
    confirmDisabled: false,
    loading: false,
    persistent: false,
    closeOnEscape: true,
    closeAriaLabel: 'Close modal',
    modalClass: 'rounded-xl',
    headerClass: '',
    contentClass: 'p-6',
    footerClass: '',
    backdropClass: '',
    iconClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    confirmButtonClass: '',
  })

  const emit = defineEmits<Emits>()

  // Computed properties
  const isOpen = computed(() => props.modelValue)

  const modalSizeClass = computed(() => {
    const sizes = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      full: 'max-w-full mx-4',
    }
    return sizes[props.size]
  })

  // Methods
  const close = () => {
    if (props.loading && props.persistent) return

    emit('update:modelValue', false)
    emit('close')
  }

  const cancel = () => {
    if (props.loading && props.persistent) return

    emit('cancel')
    close()
  }

  const confirm = () => {
    emit('confirm')
    // Don't auto-close on confirm - let parent handle it
  }

  const handleBackdropClick = () => {
    if (!props.persistent) {
      close()
    }
  }

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.closeOnEscape && isOpen.value) {
      close()
    }
  }

  // Prevent body scroll when modal is open
  const preventBodyScroll = () => {
    document.body.style.overflow = 'hidden'
  }

  const restoreBodyScroll = () => {
    document.body.style.overflow = ''
  }

  // Watchers
  watch(isOpen, (newValue) => {
    if (newValue) {
      preventBodyScroll()
      emit('opened')
    } else {
      restoreBodyScroll()
      emit('closed')
    }
  })

  // Lifecycle
  onMounted(() => {
    document.addEventListener('keydown', handleEscape)

    if (isOpen.value) {
      preventBodyScroll()
    }
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleEscape)
    restoreBodyScroll()
  })
</script>

<style scoped>

  /* Ensure modal is above everything */
  .fixed.inset-0.z-50 {
    z-index: 9999;
  }

  /* Smooth backdrop transition */
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }

  /* Focus trap styles */
  .modal-content:focus {
    outline: none;
  }

  /* Custom scrollbar for modal content */
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background-color: rgb(244 244 245);
  }

  .dark .overflow-y-auto::-webkit-scrollbar-track {
    background-color: rgb(39 39 42);
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgb(212 212 216);
    border-radius: 9999px;
  }

  .dark .overflow-y-auto::-webkit-scrollbar-thumb {
    background-color: rgb(82 82 91);
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgb(161 161 170);
  }

  .dark .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background-color: rgb(113 113 122);
  }

  /* Animation for loading state */
  @media (prefers-reduced-motion: no-preference) {
    .transition-colors {
      transition-property: color, background-color, border-color;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 150ms;
    }
  }

  /* Ensure proper button spacing */
  .space-x-3> :not([hidden])~ :not([hidden]) {
    margin-left: 0.75rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {

    .max-w-xs,
    .max-w-sm,
    .max-w-md,
    .max-w-lg,
    .max-w-xl,
    .max-w-2xl {
      max-width: calc(100vw - 2rem);
    }

    .min-h-screen {
      padding: 1rem;
    }
  }
</style>
