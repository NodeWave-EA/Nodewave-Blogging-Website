<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <div v-if="loading" class="py-16">
      <div class="container mx-auto px-4 max-w-4xl">
        <div class="animate-pulse">
          <!-- Header skeleton -->
          <div class="text-center mb-12">
            <div class="h-8 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-4 mx-auto max-w-2xl"></div>
            <div class="h-6 bg-zinc-200 dark:bg-zinc-700 rounded-lg mb-8 mx-auto max-w-md"></div>
          </div>

          <!-- Image skeleton -->
          <div class="aspect-[16/9] bg-zinc-200 dark:bg-zinc-700 rounded-xl mb-8"></div>

          <!-- Content skeleton -->
          <div class="space-y-4">
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-5/6"></div>
            <div class="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="py-16">
      <div class="container mx-auto px-4 text-center">
        <ExclamationTriangleIcon class="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Post Not Found</h1>
        <p class="text-zinc-600 dark:text-zinc-300 mb-8">{{ error }}</p>
        <router-link to="/blog"
          class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <ArrowLeftIcon class="w-5 h-5 mr-2" />
          Back to Blog
        </router-link>
      </div>
    </div>

    <!-- Post Content -->
    <article v-else-if="post" class="py-8">
      <!-- Post Header -->
      <header class="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl py-16 mb-12">
        <div class="container mx-auto px-4 max-w-4xl">
          <!-- Breadcrumb -->
          <nav class="flex items-center space-x-2 text-sm text-zinc-500 dark:text-zinc-400 mb-8">
            <router-link to="/" class="hover:text-blue-600 dark:hover:text-blue-400">Home</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <router-link to="/blog" class="hover:text-blue-600 dark:hover:text-blue-400">Blog</router-link>
            <ChevronRightIcon class="w-4 h-4" />
            <span class="text-zinc-700 dark:text-zinc-300">{{ post.title }}</span>
          </nav>

          <!-- Categories -->
          <div v-if="post.categories && post.categories.length > 0" class="flex flex-wrap gap-2 mb-6">
            <router-link v-for="category in post.categories" :key="category.id" :to="`/categories/${category.slug}`"
              class="category-badge" :class="getCategoryColor(category.name)">
              {{ category.name }}
            </router-link>
          </div>

          <!-- Title -->
          <h1 class="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white mb-6 leading-tight">
            {{ post.title }}
          </h1>

          <!-- Excerpt -->
          <p v-if="post.excerpt" class="text-xl text-zinc-600 dark:text-zinc-300 mb-8 leading-relaxed">
            {{ post.excerpt }}
          </p>

          <!-- Meta Information -->
          <div class="flex flex-wrap items-center gap-6 text-zinc-500 dark:text-zinc-400">
            <!-- Author -->
            <div v-if="post.author" class="flex items-center gap-3">
              <img :src="getStrapiImageUrl(post.author.avatar) ?? ''" :alt="post.author.name"
                class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-zinc-700" />
              <div>
                <router-link :to="`/authors/${post.author.slug || post.author.id}`"
                  class="text-zinc-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400">
                  {{ post.author.name }}
                </router-link>
                <p class="text-sm">{{ post.author.job_title || 'Author' }}</p>
              </div>
            </div>

            <!-- Publish Date -->
            <div class="flex items-center gap-2">
              <CalendarIcon class="w-5 h-5" />
              <time :datetime="post.published_at_custom || post.publishedAt">
                {{ formatDate(post.published_at_custom || post.publishedAt) }}
              </time>
            </div>

            <!-- Reading Time -->
            <div class="flex items-center gap-2">
              <ClockIcon class="w-5 h-5" />
              <span>{{ post.reading_time || 5 }} min read</span>
            </div>

            <!-- View Count -->
            <div v-if="post.view_count" class="flex items-center gap-2">
              <EyeIcon class="w-5 h-5" />
              <span>{{ formatNumber(post.view_count) }} views</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Post Body -->
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Featured Image -->
        <div v-if="getStrapiImageUrl(post.featured_image)" class="mb-12">
          <img :src="getStrapiImageUrl(post.featured_image)!"
            :alt="getStrapiImageAlt(post.featured_image) || post.title" class="w-full h-auto rounded-xl shadow-2xl"
            loading="eager" />
        </div>

        <!-- Content -->
        <div class="prose prose-lg prose-zinc dark:prose-invert max-w-none mb-12">
          <div v-html="processedContent"></div>
        </div>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="mb-12">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <router-link v-for="tag in post.tags" :key="tag.id" :to="`/tags/${tag.slug}`"
              class="tag-badge hover:bg-blue-100 dark:hover:bg-blue-900/30">
              #{{ tag.name }}
            </router-link>
          </div>
        </div>

        <!-- Social Sharing -->
        <div class="mb-12 py-8 border-y border-zinc-200 dark:border-zinc-700">
          <h3 class="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Share this post</h3>
          <div class="flex items-center gap-4">
            <a :href="shareUrls.twitter" target="_blank" rel="noopener noreferrer"
              class="share-button bg-blue-500 hover:bg-blue-600">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
              Twitter
            </a>
            <a :href="shareUrls.facebook" target="_blank" rel="noopener noreferrer"
              class="share-button bg-blue-600 hover:bg-blue-700">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
            <a :href="shareUrls.linkedin" target="_blank" rel="noopener noreferrer"
              class="share-button bg-blue-700 hover:bg-blue-800">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
            <button @click="copyToClipboard" class="share-button bg-zinc-600 hover:bg-zinc-700">
              <ClipboardIcon class="w-5 h-5" />
              Copy Link
            </button>
          </div>
        </div>

        <!-- Author Bio -->
        <div v-if="post.author" class="mb-12 p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
          <h3 class="text-xl font-semibold text-zinc-900 dark:text-white mb-4">About the Author</h3>
          <div class="flex items-start gap-6">
            <img :src="getStrapiImageUrl(post.author.avatar) ?? ''" :alt="post.author.name"
              class="w-20 h-20 rounded-full object-cover ring-2 ring-white dark:ring-zinc-700" />
            <div class="flex-1">
              <router-link :to="`/authors/${post.author.slug || post.author.id}`"
                class="text-lg font-semibold text-zinc-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 block">
                {{ post.author.name }}
              </router-link>
              <p v-if="post.author.job_title" class="text-zinc-600 dark:text-zinc-300 text-sm mb-3">
                {{ post.author.job_title }}
              </p>
              <p v-if="post.author.bio" class="text-zinc-600 dark:text-zinc-300 mb-4">
                {{ post.author.bio }}
              </p>

              <!-- Author Social Links -->
              <div v-if="post.author.social_links" class="flex items-center gap-3">
                <a v-if="getSocialUrl(post.author.social_links, 'twitter')"
                  :href="getSocialUrl(post.author.social_links, 'twitter')" target="_blank" rel="noopener noreferrer"
                  class="text-blue-500 hover:text-blue-600">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a v-if="getSocialUrl(post.author.social_links, 'linkedin')"
                  :href="getSocialUrl(post.author.social_links, 'linkedin')" target="_blank" rel="noopener noreferrer"
                  class="text-blue-700 hover:text-blue-800">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a v-if="getSocialUrl(post.author.social_links, 'github')"
                  :href="getSocialUrl(post.author.social_links, 'github')" target="_blank" rel="noopener noreferrer"
                  class="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                </a>
                <a v-if="getSocialUrl(post.author.social_links, 'website')"
                  :href="getSocialUrl(post.author.social_links, 'website')" target="_blank" rel="noopener noreferrer"
                  class="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
                  <GlobeAltIcon class="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Posts -->
        <div v-if="relatedPosts.length > 0" class="mb-12">
          <h3 class="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Related Posts</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BlogCard v-for="relatedPost in relatedPosts" :key="relatedPost.id" :post="relatedPost" />
          </div>
        </div>

        <!-- Navigation -->
        <div class="flex justify-between items-center py-8 border-t border-zinc-200 dark:border-zinc-700">
          <router-link to="/blog"
            class="inline-flex items-center px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
            <ArrowLeftIcon class="w-5 h-5 mr-2" />
            Back to Blog
          </router-link>

          <button @click="scrollToTop"
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowUpIcon class="w-5 h-5 mr-2" />
            Back to Top
          </button>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
  import { getSocialUrl } from '@/utils/social';
  import {
    ArrowLeftIcon,
    ArrowUpIcon,
    CalendarIcon,
    ChevronRightIcon,
    ClipboardIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    GlobeAltIcon,
  } from '@heroicons/vue/24/outline';
  import { computed, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import BlogCard from '../../components/blog/BlogCard.vue';
  import { blogPostsApi } from '../../services/blog';
  import type { BlogPost } from '../../types';
  import { processPostContent } from '../../utils/contentRenderer';
  import { formatDate, formatNumber } from '../../utils/format';
  import { updateSEO } from '../../utils/seo';
  import { getStrapiImageAlt, getStrapiImageUrl } from '../../utils/strapi';

  const route = useRoute()

  // Reactive data
  const post = ref<BlogPost | null>(null)
  const relatedPosts = ref<BlogPost[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Computed properties
  const processedContent = computed(() => {
    if (!post.value) return ''
    return processPostContent(post.value)
  })

  const shareUrls = computed(() => {
    if (!post.value) return {}

    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(post.value.title)

    return {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    }
  })

  // Methods
  const fetchPost = async (slug: string) => {
    try {
      loading.value = true
      error.value = null

      const response = await blogPostsApi.getBySlug(slug)
      post.value = response.data

      // Fetch related posts
      if (post.value) {
        await fetchRelatedPosts(post.value.id)

        // Update SEO
        updateSEO({
          title: post.value.title,
          description: post.value.excerpt || `Read ${post.value.title} on our blog`,
          type: 'article',
          url: window.location.href,
          image: getStrapiImageUrl(post.value.featured_image) || undefined,
          publishedTime: post.value.publishedAt,
          modifiedTime: post.value.updatedAt,
          author: post.value.author?.name,
          tags: post.value.tags?.map((tag) => tag.name),
        })
      }
    } catch (err) {
      console.error('Failed to fetch post:', err)
      error.value = 'Blog post not found or could not be loaded.'
      post.value = null
    } finally {
      loading.value = false
    }
  }

  const fetchRelatedPosts = async (postId: number) => {
    try {
      const response = await blogPostsApi.getRelated(postId, 3)
      relatedPosts.value = response.data || []
    } catch (err) {
      console.error('Failed to fetch related posts:', err)
      relatedPosts.value = []
    }
  }

  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      Business: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      Design: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      Development: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      Marketing: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      News: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
      Updates: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
    }

    return colors[categoryName] || 'bg-zinc-100 dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-300'
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Watch for route changes to handle dynamic slug changes
  watch(
    () => route.params.slug,
    (newSlug) => {
      if (newSlug && typeof newSlug === 'string') {
        fetchPost(newSlug)
      }
    },
    { immediate: true },
  )

  // Lifecycle
  onMounted(() => {
    const slug = route.params.slug as string
    if (slug) {
      fetchPost(slug)
    } else {
      error.value = 'No blog post slug provided.'
      loading.value = false
    }
  })
</script>

<style scoped>
  .category-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 9999px;
  }

  .tag-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    background-color: rgb(244 244 245);
    color: rgb(113 113 122);
    border-radius: 0.5rem;
    transition: colors 0.2s ease;
  }

  .dark .tag-badge {
    background-color: rgb(39 39 42);
    color: rgb(161 161 170);
  }

  .share-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    color: white;
    border-radius: 0.5rem;
    transition: colors 0.2s ease;
  }

  /* Prose styling for blog content */
  .prose {
    color: rgb(82 82 91);
  }

  .dark .prose {
    color: rgb(212 212 216);
  }

  .prose h1,
  .prose h2,
  .prose h3,
  .prose h4,
  .prose h5,
  .prose h6 {
    color: rgb(24 24 27);
    font-weight: 700;
  }

  .dark .prose h1,
  .dark .prose h2,
  .dark .prose h3,
  .dark .prose h4,
  .dark .prose h5,
  .dark .prose h6 {
    color: white;
  }

  .prose h1 {
    font-size: 1.875rem;
    margin-bottom: 1.5rem;
  }

  .prose h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    margin-top: 2rem;
  }

  .prose h3 {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
    margin-top: 1.5rem;
  }

  .prose p {
    margin-bottom: 1rem;
    line-height: 1.625;
  }

  .prose ul,
  .prose ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }

  .prose li {
    margin-bottom: 0.5rem;
  }

  .prose blockquote {
    border-left: 4px solid rgb(59 130 246);
    padding-left: 1.5rem;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    margin: 1.5rem 0;
    background-color: rgb(239 246 255);
    color: rgb(30 58 138);
  }

  .dark .prose blockquote {
    background-color: rgba(59, 130, 246, 0.2);
    color: rgb(147 197 253);
  }

  .prose code {
    background-color: rgb(244 244 245);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .dark .prose code {
    background-color: rgb(39 39 42);
  }

  .prose pre {
    background-color: rgb(24 24 27);
    color: rgb(244 244 245);
    padding: 1rem;
    border-radius: 0.5rem;
    overflow-x: auto;
  }

  .prose a {
    color: rgb(37 99 235);
    text-decoration: underline;
  }

  .dark .prose a {
    color: rgb(96 165 250);
  }

  .prose a:hover {
    color: rgb(29 78 216);
  }

  .dark .prose a:hover {
    color: rgb(147 197 253);
  }

  .prose img {
    border-radius: 0.5rem;
    box-shadow:
      0 20px 25px -5px rgb(0 0 0 / 0.1),
      0 8px 10px -6px rgb(0 0 0 / 0.1);
    margin: 1.5rem 0;
  }
</style>
