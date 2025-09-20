import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AOS from 'aos'
import NProgress from 'nprogress'

import App from './App.vue'
import router from './router'
import { useTheme } from './composables/useTheme'

// Import CSS
import '@/assets/main.css'
import 'aos/dist/aos.css'
import 'nprogress/nprogress.css'

const app = createApp(App)

// Setup Pinia store
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Configure NProgress with custom styling
NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.15,
  trickleSpeed: 200,
  template:
    '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
})

// Setup router guards for NProgress
router.beforeEach((to, from) => {
  // Don't show progress bar for same route
  if (to.path !== from.path) {
    NProgress.start()
  }
  return true
})

router.afterEach((to, from) => {
  // Complete progress bar
  NProgress.done()

  // Scroll to top on route change (unless hash is present)
  if (to.path !== from.path && !to.hash) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

// Handle router errors
router.onError(() => {
  NProgress.done()
})

// Initialize theme before mounting the app
const { initTheme } = useTheme()
initTheme()

// Mount the app
app.mount('#app')

// Initialize AOS (Animate On Scroll) after mounting
// Use requestAnimationFrame to ensure DOM is fully rendered
requestAnimationFrame(() => {
  AOS.init({
    duration: 800, // Animation duration in milliseconds
    once: false, // Whether animation should happen only once
    mirror: true, // Whether elements should animate out while scrolling past them
    offset: 120, // Offset (in pixels) from the original trigger point
    delay: 0, // Delay in milliseconds
    easing: 'ease-out-cubic',
    disable: false, // Conditions when AOS should be disabled
    startEvent: 'DOMContentLoaded', // Name of event, on which AOS should be initialized
    animatedClassName: 'aos-animate', // Class applied on animation
    anchorPlacement: 'top-bottom', // Defines which position of the element regarding to window should trigger the animation
  })

  // Listen for theme changes and refresh AOS to ensure proper animations
  window.addEventListener('themeChanged', () => {
    // Small delay to ensure theme transition is complete
    setTimeout(() => {
      AOS.refresh()
    }, 100)
  })
})

// Handle page visibility changes to pause/resume animations
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    AOS.refresh()
  }
})

// Refresh AOS on window resize to handle responsive changes
let resizeTimer: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    AOS.refresh()
  }, 250)
})

// Global error handling
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error)
  console.error('Component instance:', instance)
  console.error('Error info:', info)

  // Hide progress bar if there's an error
  NProgress.done()
}

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
  NProgress.done()
})

// Add global performance monitoring (development only)
if (import.meta.env.DEV) {
  // Monitor long tasks
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(() => {
      console.log('🎯 NodeWave Blog loaded successfully!')
    })
  }
}
