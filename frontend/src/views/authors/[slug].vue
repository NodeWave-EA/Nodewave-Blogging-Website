<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <AuthorPageSkeleton v-if="loading" />

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-black dark:text-white mb-2">Author Not Found</h1>
        <p class="text-black dark:text-white mb-6">{{ error }}</p>
        <router-link to="/authors"
          class="rounded-lg font-semibold px-6 py-3 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          View All Authors
        </router-link>
      </div>
    </div>

    <!-- Author Content -->
    <div v-else-if="author" class="py-8">
      <!-- Author Header -->
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="flex flex-col md:flex-row items-center gap-8">
          <!-- Author Avatar -->
          <div class="flex-shrink-0">
            <img :src="getStrapiImageUrl(author?.avatar) ?? ''" :alt="author?.name || 'Author'"
              class="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-zinc-800 shadow-lg" />
          </div>

          <!-- Author Info -->
          <div class="flex-1 text-center md:text-left">
            <h1 class="text-4xl font-bold text-black dark:text-white mb-2">
              {{ author?.name }}
            </h1>

            <p v-if="author?.job_title" class="text-xl text-blue-600 dark:text-blue-400 font-semibold mb-4">
              {{ author.job_title }}
            </p>

            <p v-if="author?.bio" class="text-lg text-black dark:text-white mb-6 leading-relaxed">
              {{ author.bio }}
            </p>

            <!-- Author Stats -->
            <div
              class="flex items-center justify-center md:justify-start gap-6 text-sm text-black dark:text-white mb-6">
              <div v-if="author?.follower_count" class="flex items-center gap-2">
                <UsersIcon class="w-5 h-5" />
                <span>{{ formatNumber(author.follower_count) }} followers</span>
              </div>

              <div v-if="author?.createdAt" class="flex items-center gap-2">
                <CalendarIcon class="w-5 h-5" />
                <span>Writing since
                  {{
                    new Date(author.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })
                  }}</span>
              </div>
            </div>

            <!-- Social Links -->
            <div v-if="author?.social_links" class="flex items-center justify-center md:justify-start gap-4">
              <span class="text-sm font-medium text-black dark:text-white">Follow:</span>

              <!-- Render each social link with a larger, consistent hit area and spacing. -->
              <SocialLink v-for="(link, idx) in author.social_links" :key="link.url ?? link.platform ?? idx"
                :link="link"
                class="p-2 transition-all text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/5" />
            </div>
          </div>
        </div>

        <!-- Author Specialties -->
        <div v-if="author?.expertise_areas && author.expertise_areas.length > 0" class="mt-8">
          <h3 class="text-lg font-semibold text-black dark:text-white mb-4">Specialties</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in author.expertise_areas" :key="tag.id"
              class="px-3 py-1 text-sm font-medium rounded-full bg-transparent text-black dark:text-white border border-black dark:border-white">
              {{ tag.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Author's Posts -->
      <section class="container mx-auto px-4 max-w-6xl">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-black dark:text-white mb-2">
            Posts by {{ author?.name }}
          </h2>
          <p class="text-black dark:text-white">
            {{ posts.length }} {{ posts.length === 1 ? 'post' : 'posts' }} published
          </p>
        </div>

        <!-- Posts Grid -->
        <div v-if="posts.length > 0" class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <BlogCard v-for="post in posts" :key="post.id" :post="post"
            class="hover:scale-105 transition-transform duration-300" />
        </div>

        <!-- No Posts -->
        <div v-else class="text-center py-16">
          <DocumentTextIcon class="w-16 h-16 text-black dark:text-white mx-auto mb-4" />
          <h3 class="text-xl font-semibold text-black dark:text-white mb-2">No Posts Yet</h3>
          <p class="text-black dark:text-white mb-6">
            {{ author?.name }} hasn't published any posts yet.
          </p>
          <router-link to="/blog"
            class="rounded-lg font-semibold px-6 py-3 bg-transparent border border-black dark:border-white text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
            Explore All Posts
          </router-link>
        </div>

        <!-- Pagination -->
        <div v-if="posts.length > 0 && pagination.pageCount > 1" class="mt-12">
          <div class="flex items-center justify-center gap-2">
            <button :disabled="pagination.page <= 1" @click="goToPage(pagination.page - 1)"
              class="px-4 py-2 text-sm font-medium text-black dark:text-white bg-transparent border border-black dark:border-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>

            <span class="px-4 py-2 text-sm text-black dark:text-white">
              Page {{ pagination.page }} of {{ pagination.pageCount }}
            </span>

            <button :disabled="pagination.page >= pagination.pageCount" @click="goToPage(pagination.page + 1)"
              class="px-4 py-2 text-sm font-medium text-black dark:text-white bg-transparent border border-black dark:border-white rounded-lg hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    CalendarIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon,
    UsersIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';

  // Components
  import AuthorPageSkeleton from '@/components/author/AuthorPageSkeleton.vue';
  import SocialLink from '@/components/author/SocialLink.vue';
  import BlogCard from '../../components/blog/BlogCard.vue';

  // Services & Types
  import { authorsApi, blogPostsApi } from '../../services/blog';
  import type { Author, BlogPost, PaginationMeta } from '../../types';

  // Utils
  import { getStrapiImageUrl } from '../../utils/strapi';

  const route = useRoute()

  // State
  const author = ref<Author | null>(null)
  const posts = ref<BlogPost[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)
  const pagination = ref<PaginationMeta>({
    page: 1,
    pageSize: 9,
    pageCount: 1,
    total: 0,
  })

  // Computed
  const slug = computed(() => route.params.slug as string)

  // Utility function to format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  // Fetch author data
  const fetchAuthor = async () => {
    try {
      loading.value = true
      error.value = null

      const response = await authorsApi.getBySlug(slug.value)
      author.value = response.data

      // Fetch author's posts
      await fetchAuthorPosts()
    } catch (err: any) {
      console.error('Error fetching author:', err)
      error.value = err.response?.data?.error?.message || 'Author not found'
    } finally {
      loading.value = false
    }
  }

  // Fetch author's posts
  const fetchAuthorPosts = async (page: number = 1) => {
    if (!author.value) return

    try {
      const response = await blogPostsApi.getByAuthor(author.value.id, {
        page,
        pageSize: pagination.value.pageSize,
      })

      posts.value = response.data
      if (response.meta?.pagination) {
        pagination.value = response.meta.pagination
      }
    } catch (err) {
      console.error('Error fetching author posts:', err)
    }
  }

  // Navigation
  const goToPage = (page: number) => {
    fetchAuthorPosts(page)
  }

  // Lifecycle
  onMounted(() => {
    fetchAuthor()
  })

  // Watch for route changes
  import { watch } from 'vue';
  watch(
    () => route.params.slug,
    () => {
      if (route.params.slug) {
        fetchAuthor()
      }
    },
  )
</script>
