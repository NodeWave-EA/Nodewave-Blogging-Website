<template>
  <section class="mt-10 text-center">
    <h2 class="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ready to dive in?</h2>
    <p class="text-muted-foreground max-w-2xl mx-auto mb-6">
      Explore the latest insights on our blog or subscribe to get updates straight to your inbox.
    </p>

    <!-- Search Bar -->
    <div class="max-w-md mx-auto mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          @keyup.enter="performSearch"
          type="text"
          placeholder="Search articles..."
          class="w-full px-4 py-3 pl-12 pr-12 text-sm bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        />
        <MagnifyingGlassIcon class="absolute left-3 top-3.5 w-5 h-5 text-zinc-400" />
        <button
          @click="performSearch"
          class="absolute right-3 top-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </div>
    </div>

    <!-- CTA Buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto">
      <router-link
        to="/blog"
        class="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition duration-200 shadow-md hover:shadow-lg w-full sm:w-auto group"
      >
        <BookOpenIcon class="w-5 h-5 transition duration-200 group-hover:scale-110" />
        Explore Blog
      </router-link>

      <button
        type="button"
        @click="openNewsletter"
        class="inline-flex items-center gap-2 px-8 py-3 bg-transparent text-foreground font-semibold rounded-lg border border-border hover:bg-muted transition duration-200 w-full sm:w-auto group"
      >
        <EnvelopeIcon class="w-5 h-5 transition duration-200 group-hover:scale-110" />
        Subscribe
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpenIcon, EnvelopeIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const searchQuery = ref('')

const openNewsletter = () => {
  window.dispatchEvent(new CustomEvent('open-newsletter'))
}

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/blog', query: { search: searchQuery.value.trim() } })
  }
}
</script>
