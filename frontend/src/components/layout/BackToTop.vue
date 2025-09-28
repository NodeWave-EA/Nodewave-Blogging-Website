<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-8 scale-75"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-8 scale-75"
  >
    <div v-if="isVisible" class="fixed bottom-6 right-6 z-50 group">
      <!-- Circular Progress Background -->
      <div class="relative">
        <!-- Progress Circle -->
        <svg
          class="w-14 h-14 -rotate-90 transition-transform duration-300 group-hover:scale-110"
          viewBox="0 0 56 56"
        >
          <!-- Background circle -->
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgb(var(--color-border))"
            stroke-width="2"
            opacity="0.3"
          />
          <!-- Progress circle -->
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="rgb(var(--color-primary))"
            stroke-width="2"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="dashOffset"
            class="transition-all duration-300 ease-out"
          />
        </svg>

        <!-- Button -->
        <button
          @click="scrollToTop"
          class="absolute inset-0 bg-transparent hover:bg-primary/10 text-foreground hover:text-primary w-14 h-14 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background backdrop-blur-sm hover:backdrop-blur-md group-hover:shadow-lg"
          aria-label="Back to top"
          type="button"
        >
          <!-- Arrow Icon -->
          <svg
            class="w-5 h-5 mx-auto transition-transform duration-300 group-hover:scale-110"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const isVisible = ref<boolean>(false)
const scrollProgress = ref<number>(0)

// Circle properties for progress indicator
const radius = 24
const circumference = computed(() => 2 * Math.PI * radius)
const dashOffset = computed(() => {
  return circumference.value - (scrollProgress.value / 100) * circumference.value
})

const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

const handleScroll = (): void => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const windowHeight = window.innerHeight
  const documentHeight = document.documentElement.scrollHeight - windowHeight

  // Show button when scrolled past 300px
  isVisible.value = scrollTop > 300

  // Calculate scroll progress percentage
  if (documentHeight > 0) {
    scrollProgress.value = Math.min(Math.max((scrollTop / documentHeight) * 100, 0), 100)
  } else {
    scrollProgress.value = 0
  }
}

// Throttle scroll events for better performance
let ticking = false
const throttledHandleScroll = (): void => {
  if (!ticking) {
    requestAnimationFrame(() => {
      handleScroll()
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  window.addEventListener('scroll', throttledHandleScroll, { passive: true })
  // Initial calculation
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledHandleScroll)
})
</script>
