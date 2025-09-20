<template>
  <article
    class="group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-transparent border border-black/10 dark:border-white/10 rounded-lg backdrop-blur-md">
    <router-link :to="`/blog/${post.slug}`" class="block h-full">
      <!-- Featured Image -->
      <div class="aspect-[16/9] relative overflow-hidden">
        <img v-if="getStrapiImageUrl(post.featured_image)" :src="getStrapiImageUrl(post.featured_image)!"
          :alt="getStrapiImageAlt(post.featured_image) || post.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div v-else
          class="w-full h-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center">
          <DocumentTextIcon class="w-16 h-16 text-white/50" />
        </div>

        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <!-- Featured Badge -->
        <div v-if="post.featured" class="absolute top-4 left-4">
          <span
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg">
            <StarIcon class="w-3 h-3" />
            Featured
          </span>
        </div>

        <!-- Reading Time -->
        <div class="absolute top-4 right-4">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/70 dark:bg-white/10 backdrop-blur-sm text-white dark:text-gray-200">
            <ClockIcon class="w-3 h-3" />
            {{ post.reading_time || 5 }}min
          </span>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Categories and Date -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span v-for="category in post.categories?.slice(0, 2) || []" :key="category.id" :class="[
              'px-3 py-1.5 text-xs font-semibold rounded-full transition-all',
              getCategoryColor(category.name)
            ]">
              {{ category.name }}
            </span>
          </div>
          <time :datetime="post.published_at_custom || post.publishedAt"
            class="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {{ formatDate(post.published_at_custom || post.publishedAt) }}
          </time>
        </div>

        <!-- Title -->
        <h3
          class="text-xl font-bold font-heading text-black dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-6 leading-relaxed">
          {{ post.excerpt || generateExcerpt(post.content || '', 150) || 'No excerpt available.' }}
        </p>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
          <span v-for="tag in post.tags.slice(0, 3)" :key="tag.id"
            class="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100">
            #{{ tag.name }}
          </span>
          <span v-if="post.tags.length > 3"
            class="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-gray-100">
            +{{ post.tags.length - 3 }}
          </span>
        </div>

        <!-- Author and Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
          <!-- Author Info -->
          <div class="flex items-center gap-3">
            <img v-if="post.author && getStrapiImageUrl(post.author.profile_picture)"
              :src="getStrapiImageUrl(post.author.profile_picture)!" :alt="post.author.name"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 dark:ring-gray-700" />
            <UserCircleIcon v-else class="w-10 h-10 text-gray-400 dark:text-gray-500" />
            <div>
              <p class="text-sm font-semibold text-black dark:text-white">
                {{ post.author?.name || 'Anonymous' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ post.author?.role || 'Author' }}
              </p>
            </div>
          </div>

          <!-- Engagement Stats -->
          <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div v-if="post.view_count" class="flex items-center gap-1">
              <EyeIcon class="w-4 h-4 mr-1" />
              {{ formatNumber(post.view_count) }}
            </div>
            <div v-if="post.like_count" class="flex items-center">
              <HeartIcon class="w-4 h-4 mr-1" />
              {{ formatNumber(post.like_count) }}
            </div>
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
</template>

<script setup lang="ts">
  import {
    ArrowRightIcon,
    ClockIcon,
    DocumentTextIcon,
    EyeIcon,
    HeartIcon,
    StarIcon,
    UserCircleIcon,
  } from '@heroicons/vue/24/outline';
  import type { BlogPost } from '../../types';
  import { generateExcerpt } from '../../utils/contentRenderer';
  import { formatDate, formatNumber } from '../../utils/format';
  import { getStrapiImageAlt, getStrapiImageUrl } from '../../utils/strapi';

  interface Props {
    post: BlogPost
  }

  defineProps<Props>()

  // Category color mapping for visual distinction (returns Tailwind classes only)
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
    return colors[categoryName] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
  }
</script>

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
