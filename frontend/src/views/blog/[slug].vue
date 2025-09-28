<template>
  <div class="min-h-screen bg-transparent">
    <!-- Loading State -->
    <BlogPostPageSkeleton v-if="loading" />

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
      <header class="bg-transparent backdrop-blur-xl py-16 mb-12">
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
              <router-link :to="`/authors/${post.author.slug || post.author.id}`"
                :title="`View posts by ${post.author.name}`" aria-label="View author page"
                class="block rounded-full overflow-hidden">
                <img :src="getStrapiImageUrl(post.author.avatar) ?? ''" :alt="post.author.name"
                  class="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-zinc-700" />
              </router-link>

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
              <time :datetime="getPostDateISO(post)">
                {{ formatDate(post) }}
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

        <!-- Author Bio removed: author information remains accessible via the header/meta links -->

        <!-- Related Posts -->
        <div v-if="relatedPosts.length > 0" class="mb-12">
          <h3 class="text-2xl font-bold text-zinc-900 dark:text-white mb-8">Related Posts</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

          <div class="flex items-center gap-4">
            <button @click="handleToggleLike" :disabled="liking"
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors">
              <component :is="liked ? HeartSolid : HeartOutline" class="w-5 h-5" :class="{ 'text-red-600': liked }" />
              <span>{{ displayedLikeCount }}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
  import { incrementView, toggleLikePost } from '@/services/postMetrics';
  import { usePostMetricsStore } from '@/stores/postMetrics';
  import { dbg } from '@/utils/debug';
  import { fetchRelatedPosts } from '@/utils/relatedPosts';
  import {
    ArrowLeftIcon,
    CalendarIcon,
    ChevronRightIcon,
    ClipboardIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    HeartIcon as HeartOutline,
  } from '@heroicons/vue/24/outline';
  import { HeartIcon as HeartSolid } from '@heroicons/vue/24/solid';
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import BlogCard from '../../components/blog/BlogCard.vue';
  import BlogPostPageSkeleton from '../../components/blog/BlogPostPageSkeleton.vue';
  import { blogPostsApi } from '../../services/blog';
  import type { BlogPost } from '../../types';
  import { processPostContent } from '../../utils/contentRenderer';
  import { formatDate, formatNumber, getPostDateISO } from '../../utils/format';
  import { updateSEO } from '../../utils/seo';
  import { getStrapiImageAlt, getStrapiImageUrl } from '../../utils/strapi';

  const route = useRoute()

  // Reactive data
  const post = ref<BlogPost | null>(null)
  const relatedPosts = ref<BlogPost[]>([])
  const metricsStore = usePostMetricsStore()
  const loading = ref(true)
  const error = ref<string | null>(null)
  const liking = ref(false)
  const liked = ref(false)

  const displayedLikeCount = computed(() => {
    if (!post.value) return 0
    return metricsStore.getMetrics(post.value.id)?.like_count ?? post.value.like_count ?? 0
  })

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
      dbg('BlogPostView', 'fetchPost', { slug, response })
      post.value = response.data

      // Fetch related posts
      if (post.value) {
        await fetchRelatedPostsFor()

        // Update metrics store and then call the standard collection update endpoint
        if (!post.value) return
        metricsStore.updateFromPost(post.value)

        // Persist liked state from localStorage into the store
        const likedSet = loadLikedSet()
        const isLiked = likedSet.has(post.value.id)
        liked.value = isLiked
        metricsStore.setLikedFor(post.value.id, isLiked)

        // Only increment view if this browser hasn't viewed this post before
        const viewedSet = loadViewedSet()
        if (!viewedSet.has(post.value.id)) {
          try {
            const updated = await incrementView(post.value.id, post.value.view_count || 0)
            if (updated) {
              post.value = updated
              metricsStore.updateFromPost(updated)
            }
            // mark as viewed locally (permanent) so subsequent refreshes won't increment
            viewedSet.add(post.value.id)
            saveViewedSet(viewedSet)
          } catch (err) {
            console.error('Failed to increment view count via collection update:', err)
          }
        }
      }

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
    } catch (err) {
      console.error('Failed to fetch post:', err)
      error.value = 'Blog post not found or could not be loaded.'
      post.value = null
    } finally {
      loading.value = false
    }
  }

  // Fetch related posts using dedicated utility which builds a category/tag intersection query
  const fetchRelatedPostsFor = async () => {
    if (!post.value) {
      relatedPosts.value = []
      return
    }

    try {
      // fetchRelatedPosts uses the current post's categories/tags to build a precise query
      const posts = await fetchRelatedPosts(post.value, 4)
      relatedPosts.value = posts || []
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

  // Toggle like handler for the post detail page
  const handleToggleLike = async () => {
    if (!post.value) return
    liking.value = true

    // Determine current state from the metrics store (prefers local optimistic state)
    const currentMetrics = metricsStore.getMetrics(post.value.id) || {}
    const currentlyLiked = currentMetrics.liked ?? liked.value ?? false
    const currentCount = currentMetrics.like_count ?? post.value.like_count ?? 0

    // Optimistic UI update
    if (currentlyLiked) {
      liked.value = false
      metricsStore.decrementLikeLocal(post.value.id)
      metricsStore.setLikedFor(post.value.id, false)
      post.value.like_count = Math.max(0, currentCount - 1)
    } else {
      liked.value = true
      metricsStore.incrementLikeLocal(post.value.id)
      metricsStore.setLikedFor(post.value.id, true)
      post.value.like_count = currentCount + 1
    }

    try {
      // Send the toggle request with the prior state (so backend can apply +/-)
      const updated = await toggleLikePost(post.value.id, currentlyLiked, currentCount)
      if (updated) {
        post.value = updated
        metricsStore.updateFromPost(updated)
        // Persist liked flag locally so it survives across sessions for this browser
        const likedSet2 = loadLikedSet()
        if (liked.value) {
          likedSet2.add(post.value.id)
        } else {
          likedSet2.delete(post.value.id)
        }
        saveLikedSet(likedSet2)
        metricsStore.setLikedFor(post.value.id, liked.value)
      }
    } catch (err) {
      // Revert optimistic update on failure
      console.error('Failed to toggle like:', err)
      if (currentlyLiked) {
        // revert to liked
        metricsStore.incrementLikeLocal(post.value.id)
        metricsStore.setLikedFor(post.value.id, true)
        liked.value = true
        post.value.like_count = currentCount
      } else {
        // revert to unliked
        metricsStore.decrementLikeLocal(post.value.id)
        metricsStore.setLikedFor(post.value.id, false)
        liked.value = false
        post.value.like_count = currentCount
      }
    } finally {
      liking.value = false
    }
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

  // Structured data injection: place generated JSON-LD into <head> for SEO crawlers
  const SD_SCRIPT_ID = 'nw-structured-data'
  let sdScript: HTMLScriptElement | null = null

  const CANONICAL_ID = 'nw-canonical-link'
  const OG_TITLE_ID = 'nw-og-title'
  const OG_DESCRIPTION_ID = 'nw-og-description'
  const OG_IMAGE_ID = 'nw-og-image'
  const TWITTER_CARD_ID = 'nw-twitter-card'
  const TWITTER_TITLE_ID = 'nw-twitter-title'
  const TWITTER_DESCRIPTION_ID = 'nw-twitter-description'
  const TWITTER_IMAGE_ID = 'nw-twitter-image'

  function removeStructuredDataScript() {
    try {
      const existing = document.getElementById(SD_SCRIPT_ID)
      if (existing && existing.parentNode) existing.parentNode.removeChild(existing)
      sdScript = null
    } catch (e) {
      // ignore
    }
  }

  function removeMetaTags() {
    try {
      const c = document.getElementById(CANONICAL_ID)
      if (c && c.parentNode) c.parentNode.removeChild(c)
        ;[OG_TITLE_ID, OG_DESCRIPTION_ID, OG_IMAGE_ID].forEach((id) => {
          const m = document.getElementById(id)
          if (m && m.parentNode) m.parentNode.removeChild(m)
        })
        ;[TWITTER_CARD_ID, TWITTER_TITLE_ID, TWITTER_DESCRIPTION_ID, TWITTER_IMAGE_ID].forEach((id) => {
          const m = document.getElementById(id)
          if (m && m.parentNode) m.parentNode.removeChild(m)
        })
    } catch (e) {
      // ignore
    }
  }

  function ensureMetaTag(prop: string, content: string | null, id: string) {
    try {
      if (!content) return
      let el = document.getElementById(id) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', prop)
        el.id = id
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    } catch (e) {
      // ignore
    }
  }

  function ensureMetaTagName(name: string, content: string | null, id: string) {
    try {
      if (!content) return
      let el = document.getElementById(id) as HTMLMetaElement | null
      if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        el.id = id
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    } catch (e) {
      // ignore
    }
  }

  function ensureCanonical(href: string | null) {
    try {
      if (!href) return
      let link = document.getElementById(CANONICAL_ID) as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        link.id = CANONICAL_ID
        document.head.appendChild(link)
      }
      link.href = href
    } catch (e) {
      // ignore
    }
  }

  function updateStructuredData() {
    try {
      removeMetaTags()
      removeStructuredDataScript()
      if (!post.value) return
      const structured = (post.value as any).seo?.structured_data
      if (structured) {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = SD_SCRIPT_ID
        script.text = typeof structured === 'string' ? structured : JSON.stringify(structured)
        document.head.appendChild(script)
        sdScript = script

        // Also update canonical and Open Graph meta tags using seo fields
        const canonical = post.value.seo?.canonical_url || post.value.canonical_url
        // Normalize canonical into absolute URL if it's relative — prefer window.location origin
        let canonicalAbs: string | null = null
        if (canonical) {
          if (String(canonical).startsWith('http')) {
            canonicalAbs = canonical
          } else {
            // Ensure the canonical path uses the /blog/ prefix unless the provided path already contains it
            let path = String(canonical)
            if (!path.startsWith('/')) path = `/${path}`
            if (!path.startsWith('/blog/')) path = `/blog/${path.replace(/^\//, '')}`
            canonicalAbs = `${window.location.origin}${path}`
          }
        }
        ensureCanonical(canonicalAbs)

        const ogTitle = post.value.seo?.og_title || post.value.meta_title || post.value.title || null
        const ogDesc =
          post.value.seo?.og_description || post.value.meta_description || post.value.excerpt || null
        const ogImageUrl =
          getStrapiImageUrl(post.value.seo?.og_image || post.value.featured_image) || null

        ensureMetaTag('og:title', ogTitle, OG_TITLE_ID)
        ensureMetaTag('og:description', ogDesc, OG_DESCRIPTION_ID)
        ensureMetaTag('og:image', ogImageUrl, OG_IMAGE_ID)

        // Twitter meta tags
        const twitterCard = post.value.seo?.twitter_card || 'summary_large_image'
        const twitterTitle = post.value.seo?.twitter_title || ogTitle
        const twitterDesc = post.value.seo?.twitter_description || ogDesc
        const twitterImage =
          getStrapiImageUrl(
            post.value.seo?.twitter_image || post.value.seo?.og_image || post.value.featured_image,
          ) || ogImageUrl

        ensureMetaTagName('twitter:card', twitterCard, TWITTER_CARD_ID)
        ensureMetaTagName('twitter:title', twitterTitle, TWITTER_TITLE_ID)
        ensureMetaTagName('twitter:description', twitterDesc, TWITTER_DESCRIPTION_ID)
        ensureMetaTagName('twitter:image', twitterImage, TWITTER_IMAGE_ID)
      }
    } catch (e) {
      console.error('Failed to update structured data script/meta tags:', e)
    }
  }

  // Keep the JSON-LD in sync with the post reactive value
  watch(
    () => post.value,
    () => {
      updateStructuredData()
    },
    { immediate: true },
  )

  onUnmounted(() => {
    removeStructuredDataScript()
    removeMetaTags()
  })

  const VIEWED_KEY = 'nw_viewed_posts'
  const LIKED_KEY = 'nw_liked_posts'

  const loadViewedSet = (): Set<number> => {
    try {
      const raw = localStorage.getItem(VIEWED_KEY)
      if (!raw) return new Set()
      const arr = JSON.parse(raw) as number[]
      return new Set(arr)
    } catch (e) {
      return new Set()
    }
  }

  const saveViewedSet = (s: Set<number>) => {
    try {
      localStorage.setItem(VIEWED_KEY, JSON.stringify(Array.from(s)))
    } catch (e) {
      // ignore
    }
  }

  const loadLikedSet = (): Set<number> => {
    try {
      const raw = localStorage.getItem(LIKED_KEY)
      if (!raw) return new Set()
      const arr = JSON.parse(raw) as number[]
      return new Set(arr)
    } catch (e) {
      return new Set()
    }
  }

  const saveLikedSet = (s: Set<number>) => {
    try {
      localStorage.setItem(LIKED_KEY, JSON.stringify(Array.from(s)))
    } catch (e) {
      // ignore
    }
  }
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
