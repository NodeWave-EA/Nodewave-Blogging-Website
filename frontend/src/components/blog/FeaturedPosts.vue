<template>
  <section
    class="relative py-24 sm:py-28 bg-gradient-to-b from-transparent via-zinc-50/40 dark:via-zinc-900/40 to-transparent">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-20" data-aos="fade-up">
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Featured Posts
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300">
          Hand-picked highlights from our latest writing — prioritized by editorial choice and
          recency.
        </p>
        <div class="mt-6 w-20 h-1 mx-auto rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600"></div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BlogPostSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Content -->
      <div v-else-if="featured.length > 0" class="space-y-12">
        <!-- Masonry -->
        <div v-if="gridVariant === 'masonry'" :class="gridWrapperClass" data-aos="fade-up" data-aos-delay="120">
          <FeaturedPostCard v-for="post in featured" :key="post.id" :post="post" variant="compact"
            class="hover:-translate-y-2 hover:shadow-xl transition-transform duration-300" />
        </div>

        <!-- Grid with hero -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" data-aos="fade-up"
          data-aos-delay="120">
          <!-- Hero post -->
          <div v-if="featured[0]" class="lg:col-span-2">
            <FeaturedPostCard :post="featured[0]" variant="hero"
              class="hover:shadow-2xl hover:-translate-y-2 transition-all duration-300" />
          </div>

          <!-- Remaining -->
          <FeaturedPostCard v-for="post in featured.slice(1)" :key="post.id" :post="post" variant="compact"
            class="hover:-translate-y-2 hover:shadow-xl transition-all duration-300" />
        </div>

        <!-- CTA -->
        <div class="text-center mt-14" data-aos="fade-up" data-aos-delay="240">
          <router-link to="/blog"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base sm:text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
            View All Posts
            <ArrowRightIcon class="w-5 h-5" />
          </router-link>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="!loading" icon="document" title="No Featured Posts"
        description="There are currently no featured posts. Check back later for curated content." />
    </div>
  </section>
</template>

<script lang="ts" setup>
  import { blogPostsApi } from '@/services';
  import type { BlogPost } from '@/types';
  import { dbg, moduleLoaded } from '@/utils/debug';
  import { ArrowRightIcon } from '@heroicons/vue/24/outline';
  import { computed, onMounted, onUnmounted, ref, toRefs } from 'vue';
  import EmptyState from '../ui/EmptyState.vue';
  import BlogPostSkeleton from './BlogPostSkeleton.vue';
  import FeaturedPostCard from './FeaturedPostCard.vue';

  moduleLoaded('FeaturedPosts.vue')

  const props = withDefaults(
    defineProps<{
      gridVariant?: 'grid' | 'masonry'
    }>(),
    { gridVariant: 'grid' },
  )

  const { gridVariant } = toRefs(props)

  const featured = ref<BlogPost[]>([])
  const loading = ref(true)

  const loadFeaturedFromApi = async (background = false) => {
    try {
      if (!background) loading.value = true
      dbg('FeaturedPosts.vue', 'loadFeatured start')
      const resp = await blogPostsApi.getFeatured(6)
      const posts = (resp.data || []).slice(0, 6)
      featured.value = posts
      dbg('FeaturedPosts.vue', 'loadFeatured got', {
        len: featured.value.length,
      })
    } catch (error) {
      dbg('FeaturedPosts.vue', 'loadFeatured error', { error })
      featured.value = featured.value || []
    } finally {
      if (!background) loading.value = false
      dbg('FeaturedPosts.vue', 'loadFeatured finished')
    }
  }

  const initialize = async () => {
    // Always fetch from API on init to show latest featured posts
    await loadFeaturedFromApi(false)
  }

  const onFocus = () => {
    // Refresh featured posts in background when the window gains focus
    void loadFeaturedFromApi(true)
  }

  onMounted(() => {
    void initialize()
    window.addEventListener('focus', onFocus)
  })

  onUnmounted(() => {
    window.removeEventListener('focus', onFocus)
  })

  const gridWrapperClass = computed(() => {
    if (gridVariant.value === 'masonry') {
      return 'masonry gap-8'
    }
    return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'
  })
</script>

<style scoped>
  .masonry {
    column-gap: 2rem;
  }

  .masonry>article {
    break-inside: avoid;
    margin-bottom: 2rem;
  }
</style>
