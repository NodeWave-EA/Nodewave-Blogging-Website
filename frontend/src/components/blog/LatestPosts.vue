<template>
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12" data-aos="fade-up">
        <h2 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Latest Posts
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-xl text-zinc-600 dark:text-zinc-300">
          Stay up-to-date with our newest insights and updates
        </p>
        <div class="mt-6 w-24 h-1 bg-transparent mx-auto rounded-full"></div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BlogPostSkeleton v-for="n in 6" :key="n" />
      </div>

      <!-- Posts Grid -->
      <div v-else-if="latestPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article v-for="(post, index) in latestPosts" :key="post.id" :data-aos="'fade-up'" :data-aos-delay="index * 100"
          class="group bg-transparent dark:bg-transparent rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm">
          <router-link :to="`/blog/${post.slug}`" class="block h-full">
            <!-- Featured Image -->
            <div class="aspect-w-16 aspect-h-9 relative overflow-hidden">
              <!-- <img v-if="getStrapiImageUrl(post.featured_image)" :src="getStrapiImageUrl(post.featured_image)!"
                :alt="getStrapiImageAlt(post.featured_image) || post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div v-else class="w-full h-full bg-transparent flex items-center justify-center">
                <BookOpenIcon class="w-16 h-16 text-white opacity-50" />
              </div> -->

              <!-- Gradient Overlay -->
              <div
                class="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              </div>
            </div>

            <!-- Content -->
            <div class="p-6 flex flex-col h-full">
              <!-- Categories & Date -->
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center space-x-2">
                  <span v-for="category in post.categories?.slice(0, 2) || []" :key="category.id"
                    class="px-3 py-1 text-xs font-medium bg-transparent dark:bg-transparent text-blue-700 dark:text-blue-300 rounded-full">
                    {{ category.name }}
                  </span>
                </div>
                <time :datetime="post.published_at_custom || post.publishedAt"
                  class="text-sm text-zinc-500 dark:text-zinc-400">
                  {{ formatDate(post.published_at_custom || post.publishedAt) }}
                </time>
              </div>

              <!-- Title -->
              <h3
                class="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-grow">
                {{ post.title }}
              </h3>

              <!-- Excerpt -->
              <p class="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-3 mb-4 flex-grow">
                {{ post.excerpt || 'No excerpt available.' }}
              </p>

              <!-- Tags -->
              <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
                <span v-for="tag in post.tags.slice(0, 3)" :key="tag.id"
                  class="px-2 py-1 text-xs font-medium bg-transparent dark:bg-transparent text-zinc-600 dark:text-zinc-300 rounded">
                  #{{ tag.name }}
                </span>
                <span v-if="post.tags.length > 3"
                  class="px-2 py-1 text-xs font-medium bg-transparent dark:bg-transparent text-zinc-600 dark:text-zinc-300 rounded">
                  +{{ post.tags.length - 3 }}
                </span>
              </div>

              <!-- Author & Reading Time -->
              <div class="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <div class="flex items-center">
                  <!-- <img v-if="getStrapiImageUrl(post.author?.avatar)" :src="getStrapiImageUrl(post.author?.avatar)!"
                    :alt="post.author?.name" class="w-8 h-8 rounded-full mr-3" />
                  <UserCircleIcon v-else class="w-8 h-8 text-zinc-400 mr-3" /> -->
                  <div>
                    <p class="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {{ post.author?.name || 'Anonymous' }}
                    </p>
                    <p class="text-xs text-zinc-500 dark:text-zinc-400">
                      {{ post.author?.email }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center text-sm text-zinc-500 dark:text-zinc-400">
                  <ClockIcon class="w-4 h-4 mr-1" />
                  {{ post.reading_time || 5 }}min
                </div>
              </div>

              <!-- Read More Link -->
              <div class="mt-4">
                <span
                  class="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium text-sm group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  Read More
                  <ArrowRightIcon class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </router-link>
        </article>
      </div>

      <!-- Empty State -->
      <EmptyState v-else-if="!loading" icon="document" title="No Posts Yet"
        description="No blog posts have been published yet. Check back soon for new content!" />

      <!-- View All Button -->
      <div v-if="latestPosts.length > 0" class="text-center mt-12" data-aos="fade-up" data-aos-delay="400">
        <router-link to="/blog"
          class="group relative inline-flex items-center px-8 py-3 text-base font-medium rounded-full text-blue-600 bg-transparent hover:bg-transparent dark:bg-transparent dark:text-blue-400 dark:hover:bg-transparent backdrop-blur-sm transition-all duration-300 shadow-lg hover:shadow-xl">
          View All Posts
          <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          <div
            class="absolute inset-0 rounded-full bg-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { dbg, moduleLoaded } from '@/utils/debug';
  import { ArrowRightIcon, ClockIcon } from '@heroicons/vue/24/outline';
  import { onMounted, ref } from 'vue';
  import { blogPostsApi } from '../../services/blog';
  import type { BlogPost } from '../../types';
  import { formatDate } from '../../utils/format';
  import EmptyState from '../ui/EmptyState.vue';
  import BlogPostSkeleton from './BlogPostSkeleton.vue';

  moduleLoaded('LatestPosts.vue')

  const latestPosts = ref<BlogPost[]>([])
  const loading = ref(true)

  const loadLatestPosts = async () => {
    try {
      dbg('LatestPosts.vue', 'loadLatestPosts start')
      loading.value = true
      const response = await blogPostsApi.getLatest(6)
      dbg('LatestPosts.vue', 'loadLatestPosts response', { length: response.data?.length })

      latestPosts.value = response.data || []
    } catch (error) {
      dbg('LatestPosts.vue', 'loadLatestPosts error', { error })
      console.error('Failed to load latest posts:', error)
      latestPosts.value = []
    } finally {
      dbg('LatestPosts.vue', 'loadLatestPosts finished')
      loading.value = false
    }
  }

  onMounted(() => {
    dbg('LatestPosts.vue', 'mounted')
    loadLatestPosts()
  })
</script>

<style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .aspect-w-16 {
    position: relative;
    padding-bottom: calc(9 / 16 * 100%);
  }

  .aspect-h-9 .aspect-w-16>* {
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
</style>
