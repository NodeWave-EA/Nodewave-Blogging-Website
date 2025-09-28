import AOS from 'aos'
import NProgress from 'nprogress'
import { createPinia } from 'pinia'
import { createApp } from 'vue'

import { usePlaceholderStore } from '@/stores/placeholder'
import App from './App.vue'
import { useTheme } from './composables/useTheme'
import router from './router'

// Import CSS
import '@/assets/main.css'
import 'aos/dist/aos.css'
import 'nprogress/nprogress.css'

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { fab } from '@fortawesome/free-brands-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(fab, fas, far)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)

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

// Ensure placeholder image is loaded and cached before app mount
const placeholderStore = usePlaceholderStore()

async function initApp() {
  try {
    await placeholderStore.initPlaceholder()
  } catch (err) {
    // Fail gracefully — app should still mount even if placeholder lookup fails
    console.error('Failed to initialize placeholder store', err)
  }

  // Mount the app
  app.mount('#app')

  // Initialize AOS (Animate On Scroll) after mounting
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
}

initApp()

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
