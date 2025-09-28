<template>
  <section class="py-16 bg-zinc-50 dark:bg-zinc-900/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12" data-aos="fade-up">
        <h2 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Explore Categories
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-xl text-zinc-600 dark:text-zinc-300">
          Discover content organized by topics that interest you
        </p>
        <div
          class="mt-6 w-24 h-1 bg-gradient-to-r from-green-600 to-blue-600 mx-auto rounded-full"
        ></div>
      </div>

      <!-- Categories Grid -->
      <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div
            class="bg-white dark:bg-zinc-800 rounded-xl p-6 h-32 flex flex-col items-center justify-center"
          >
            <div class="w-12 h-12 bg-zinc-300 dark:bg-zinc-600 rounded-full mb-3"></div>
            <div class="w-16 h-4 bg-zinc-300 dark:bg-zinc-600 rounded mb-2"></div>
            <div class="w-12 h-3 bg-zinc-300 dark:bg-zinc-600 rounded"></div>
          </div>
        </div>
      </div>

      <div
        v-else-if="categories.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
      >
        <router-link
          v-for="(category, index) in categories"
          :key="category.id"
          :to="`/categories/${category.slug}`"
          :data-aos="'fade-up'"
          :data-aos-delay="index * 50"
          class="group bg-white dark:bg-zinc-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105"
        >
          <div class="text-center">
            <!-- Category Icon -->
            <div
              class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                ></path>
              </svg>
            </div>

            <!-- Category Name -->
            <h3
              class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
            >
              {{ category.name }}
            </h3>

            <!-- Post Count -->
            <p class="text-sm text-zinc-600 dark:text-zinc-400">
              {{ category.post_count || 0 }} posts
            </p>
          </div>
        </router-link>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading"
        icon="document"
        title="No Categories"
        description="There are no categories to display at the moment."
      />

      <!-- View All Button -->
      <div
        v-if="categories.length > 0"
        class="text-center mt-12"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <router-link
          to="/categories"
          class="group relative inline-flex items-center px-8 py-3 text-base font-medium rounded-full text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          View All Categories
          <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          <div
            class="absolute inset-0 rounded-full bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          ></div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowRightIcon } from '@heroicons/vue/24/outline'
import { categoriesApi } from '../../services/blog'
import EmptyState from '../ui/EmptyState.vue'
import type { Category } from '../../types'

const categories = ref<Category[]>([])
const loading = ref(true)

const loadCategories = async () => {
  try {
    loading.value = true
    const response = await categoriesApi.getAll()
    categories.value = response.data || []
  } catch (error) {
    console.error('Failed to load categories:', error)
    categories.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
})
</script>
