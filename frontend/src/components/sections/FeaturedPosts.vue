<template>
  <section class="py-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Header -->
      <div class="text-center mb-12" data-aos="fade-up">
        <h2 class="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 sm:text-4xl">
          Featured Posts
        </h2>
        <p class="mt-4 max-w-2xl mx-auto text-xl text-zinc-600 dark:text-zinc-300">
          Discover our most popular and impactful content
        </p>
        <div
          class="mt-6 w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"
        ></div>
      </div>

      <!-- Featured Posts Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <BlogPostSkeleton v-for="n in 3" :key="n" />
      </div>

      <div
        v-else-if="featuredPosts.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <!-- Main Featured Post -->
        <div class="lg:col-span-2" data-aos="fade-right">
          <article
            class="group relative h-full bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm"
          >
            <!-- Featured Image -->
            <div class="aspect-w-16 aspect-h-9 lg:aspect-h-10">
              <img
                v-if="getStrapiImageUrl(featuredPosts[0].featured_image)"
                :src="getStrapiImageUrl(featuredPosts[0].featured_image)!"
                :alt="getStrapiImageAlt(featuredPosts[0].featured_image) || featuredPosts[0].title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div
                v-else
                class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              >
                <BookOpenIcon class="w-16 h-16 text-white opacity-50" />
              </div>
            </div>

            <!-- Content Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
            ></div>

            <!-- Post Content -->
            <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
              <!-- Featured Badge -->
              <div class="flex items-center mb-4">
                <span
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white backdrop-blur-sm"
                >
                  <StarIcon class="w-4 h-4 mr-1" />
                  Featured
                </span>
                <!-- Categories -->
                <div class="flex items-center ml-3 space-x-2">
                  <span
                    v-for="category in featuredPosts[0].categories?.slice(0, 2) || []"
                    :key="category.id"
                    class="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full"
                  >
                    {{ category.name }}
                  </span>
                </div>
              </div>

              <!-- Title -->
              <h3 class="text-2xl lg:text-3xl font-bold mb-3 line-clamp-2">
                {{ featuredPosts[0].title }}
              </h3>

              <!-- Excerpt -->
              <p class="text-zinc-200 text-lg mb-4 line-clamp-2">
                {{ featuredPosts[0].excerpt }}
              </p>

              <!-- Meta Information -->
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <!-- Author -->
                  <div class="flex items-center">
                    <img
                      v-if="getStrapiImageUrl(featuredPosts[0].author?.profile_picture)"
                      :src="getStrapiImageUrl(featuredPosts[0].author?.profile_picture)!"
                      :alt="featuredPosts[0].author?.name"
                      class="w-8 h-8 rounded-full mr-2"
                    />
                    <UserCircleIcon v-else class="w-8 h-8 text-zinc-300 mr-2" />
                    <span class="text-sm font-medium">
                      {{ featuredPosts[0].author?.name || 'Anonymous' }}
                    </span>
                  </div>

                  <!-- Reading Time -->
                  <div class="flex items-center text-sm text-zinc-300">
                    <ClockIcon class="w-4 h-4 mr-1" />
                    {{ featuredPosts[0].reading_time || 5 }} min read
                  </div>
                </div>

                <router-link
                  :to="`/blog/${featuredPosts[0].slug}`"
                  class="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                >
                  Read More
                  <ArrowRightIcon class="w-4 h-4 ml-2" />
                </router-link>
              </div>
            </div>
          </article>
        </div>

        <!-- Secondary Featured Posts -->
        <div class="space-y-8">
          <article
            v-for="(post, index) in featuredPosts.slice(1, 3)"
            :key="post.id"
            :data-aos="`fade-left`"
            :data-aos-delay="index * 100"
            class="group bg-white/80 dark:bg-zinc-900/80 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm"
          >
            <router-link :to="`/blog/${post.slug}`" class="block">
              <!-- Image -->
              <div class="aspect-w-16 aspect-h-9">
                <img
                  v-if="getStrapiImageUrl(post.featured_image)"
                  :src="getStrapiImageUrl(post.featured_image)!"
                  :alt="getStrapiImageAlt(post.featured_image) || post.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <BookOpenIcon class="w-12 h-12 text-white opacity-50" />
                </div>
              </div>

              <!-- Content -->
              <div class="p-6">
                <!-- Categories -->
                <div class="flex items-center mb-3 space-x-2">
                  <span
                    v-for="category in post.categories?.slice(0, 2) || []"
                    :key="category.id"
                    class="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    {{ category.name }}
                  </span>
                </div>

                <!-- Title -->
                <h3
                  class="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                >
                  {{ post.title }}
                </h3>

                <!-- Excerpt -->
                <p class="text-zinc-600 dark:text-zinc-300 text-sm line-clamp-2 mb-4">
                  {{ post.excerpt }}
                </p>

                <!-- Meta -->
                <div
                  class="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400"
                >
                  <div class="flex items-center">
                    <img
                      v-if="getStrapiImageUrl(post.author?.profile_picture)"
                      :src="getStrapiImageUrl(post.author?.profile_picture)!"
                      :alt="post.author?.name"
                      class="w-6 h-6 rounded-full mr-2"
                    />
                    <UserCircleIcon v-else class="w-6 h-6 text-zinc-400 mr-2" />
                    <span>{{ post.author?.name || 'Anonymous' }}</span>
                  </div>
                  <div class="flex items-center">
                    <ClockIcon class="w-4 h-4 mr-1" />
                    {{ post.reading_time || 5 }}min
                  </div>
                </div>
              </div>
            </router-link>
          </article>
        </div>
      </div>

      <!-- Empty State -->
      <EmptyState
        v-else-if="!loading"
        icon="document"
        title="No Featured Posts"
        description="There are no featured posts to display at the moment."
      />

      <!-- View All Button -->
      <div
        v-if="featuredPosts.length > 0"
        class="text-center mt-12"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <router-link
          to="/blog"
          class="group relative inline-flex items-center px-8 py-3 text-base font-medium rounded-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl backdrop-blur-sm"
        >
          View All Posts
          <ArrowRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          <div
            class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          ></div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  BookOpenIcon,
  StarIcon,
  UserCircleIcon,
  ClockIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'
import { blogService } from '../../services/blog'
import BlogPostSkeleton from '../ui/BlogPostSkeleton.vue'
import EmptyState from '../ui/EmptyState.vue'
import type { BlogPost } from '../../types'
import { getStrapiImageUrl, getStrapiImageAlt } from '../../utils/strapi'

const featuredPosts = ref<BlogPost[]>([])
const loading = ref(true)

const loadFeaturedPosts = async () => {
  try {
    loading.value = true
    const response = await blogService.getAll(1, 3, {
      featured: true,
    })

    featuredPosts.value = response.data || []
  } catch (error) {
    console.error('Failed to load featured posts:', error)
    featuredPosts.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeaturedPosts()
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

.aspect-w-16 {
  position: relative;
  padding-bottom: calc(9 / 16 * 100%);
}

.aspect-h-9 .aspect-w-16 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.aspect-h-10 {
  padding-bottom: calc(10 / 16 * 100%);
}
</style>
