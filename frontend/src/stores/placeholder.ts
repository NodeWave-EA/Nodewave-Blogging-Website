import { findPlaceholderImageUrl } from '@/services/placeholder'
import { dbg } from '@/utils/debug'
import { defineStore } from 'pinia'

const LOCAL_STORAGE_KEY = 'nw_placeholder_image_url'

export const usePlaceholderStore = defineStore('placeholder', {
  state: () => ({
    url: null as string | null,
    initialized: false,
  }),

  getters: {
    getUrl: (state) => state.url,
  },

  actions: {
    async initPlaceholder() {
      if (this.initialized) return
      this.initialized = true

      // Try to read from localStorage first
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (saved) {
          dbg('placeholder.store', 'loaded placeholder URL from localStorage', { saved })
          this.url = saved
          return
        }
      } catch (err) {
        dbg('placeholder.store', 'localStorage read error', { err })
      }

      // Not in localStorage — fetch from Strapi
      const found = await findPlaceholderImageUrl()
      if (found) {
        this.url = found
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, found)
          dbg('placeholder.store', 'stored placeholder URL in localStorage', { found })
        } catch (err) {
          dbg('placeholder.store', 'localStorage write error', { err })
        }
      } else {
        dbg('placeholder.store', 'no placeholder found; leaving url null')
      }
    },

    // Synchronously get the placeholder, possibly null
    getPlaceholderSync() {
      return this.url
    },

    // Force-refresh placeholder image by clearing cache and re-fetching
    async refreshPlaceholder() {
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY)
      } catch (err) {
        dbg('placeholder.store', 'localStorage remove error', { err })
      }
      this.url = null
      return await this.initPlaceholder()
    },
  },
})
