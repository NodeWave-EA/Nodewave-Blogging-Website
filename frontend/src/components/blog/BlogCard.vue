<template>
  <article
    class="group relative overflow-hidden rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
    <!-- Hover Glow Effect -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>

    <router-link :to="`/blog/${post.slug}`" class="block h-full relative z-10">
      <!-- Featured Image Container -->
      <div class="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
        <!-- Featured Image -->
        <img
          v-if="getStrapiImageUrl(post.featured_image)"
          :src="getStrapiImageUrl(post.featured_image)!"
          :alt="getStrapiImageAlt(post.featured_image) || post.title"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
          :srcset="getStrapiImageSrcSet(post.featured_image)"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        <!-- Fallback Image -->
        <div
          v-else
          class="w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center">
          <DocumentTextIcon class="w-16 h-16 sm:w-20 sm:h-20 text-white/70" />
        </div>

        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-500"></div>

        <!-- Featured Badge -->
        <div v-if="post.featured" class="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg backdrop-blur-sm border border-white/20">
            <StarIcon class="w-3 h-3 sm:w-4 sm:h-4" />
            Featured
          </span>
        </div>

        <!-- Reading Time Badge -->
        <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-700 dark:text-slate-300 border border-white/30 dark:border-slate-700/30 shadow-lg">
            <ClockIcon class="w-3 h-3 sm:w-4 sm:h-4" />
            {{ post.reading_time || calculateReadingTime(post.content) || 5 }}min
          </span>
        </div>

        <!-- Category Pills Overlay -->
        <div class="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20">
          <div class="flex flex-wrap gap-1.5 sm:gap-2">
            <span
              v-for="category in post.categories?.slice(0, 2) || []"
              :key="category.id"
              :class="[
                'px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-bold rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300',
                getCategoryOverlayStyle(category.name)
              ]">
              {{ category.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content Section -->
      <div class="p-4 sm:p-6 lg:p-8">
        <!-- Date -->
        <div class="mb-3 sm:mb-4">
          <time
            :datetime="post.published_at_custom || post.publishedAt"
            class="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
            <svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {{ formatDate(post.published_at_custom || post.publishedAt) }}
          </time>
        </div>

        <!-- Title -->
        <h3 class="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 leading-tight">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 sm:mb-6 leading-relaxed">
          {{ post.excerpt || generateExcerpt(post.content || '', 150) || 'No excerpt available.' }}
        </p>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-1.5 sm:gap-2 mb-4 sm:mb-6">
          <span
            v-for="tag in post.tags.slice(0, 3)"
            :key="tag.id"
            class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-200">
            #{{ tag.name }}
          </span>
          <span
            v-if="post.tags.length > 3"
            class="px-2 py-1 sm:px-3 sm:py-1.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
            +{{ post.tags.length - 3 }}
          </span>
        </div>

        <!-- Author and Engagement -->
        <div class="flex items-center justify-between pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700">
          <!-- Author Info -->
          <div class="flex items-center gap-2 sm:gap-4">
            <div class="relative flex-shrink-0">
              <img
                v-if="post.author && getStrapiImageUrl(post.author.profile_picture)"
                :src="getStrapiImageUrl(post.author.profile_picture)!"
                :alt="post.author.name"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600"
              />
              <UserCircleIcon v-else class="w-8 h-8 sm:w-10 sm:h-10 text-slate-400 dark:text-slate-500" />
              <!-- Online Status Indicator -->
              <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {{ post.author?.name || 'Anonymous' }}
              </p>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                {{ post.author?.role || 'Author' }}
              </p>
            </div>
          </div>

          <!-- Engagement Stats -->
          <div class="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <div
              v-if="post.view_count !== undefined && post.view_count > 0"
              class="flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              <EyeIcon class="w-3 h-3 sm:w-4 sm:h-4" />
              <span class="font-semibold">{{ formatNumber(post.view_count) }}</span>
            </div>
            <div
              v-if="post.like_count !== undefined && post.like_count > 0"
              class="flex items-center gap-1 sm:gap-1.5 bg-red-100 dark:bg-red-900/30 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
              <HeartIcon class="w-3 h-3 sm:w-4 sm:h-4" />
              <span class="font-semibold">{{ formatNumber(post.like_count) }}</span>
            </div>
          </div>
        </div>

        <!-- Read More Link -->
        <div class="mt-4 sm:mt-6">
          <span class="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold text-sm sm:text-base group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
            Read Full Article
            <ArrowRightIcon class="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
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
  import { calculateReadingTime, formatDate, formatNumber } from '../../utils/format';
  import { getStrapiImageAlt, getStrapiImageSrcSet, getStrapiImageUrl } from '../../utils/strapi';

  interface Props {
    post: BlogPost
  }

  defineProps<Props>()

  // Category color mapping for visual distinction (returns Tailwind classes only)
  const getCategoryColor = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
      Business: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
      Design: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20',
      Development: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20',
      Marketing: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
      News: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
      Updates: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20',
    }
    return colors[categoryName] || 'bg-muted text-muted-foreground border border-border'
  }

  // Category overlay style for image overlay
  const getCategoryOverlayStyle = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-500/90 text-white border-blue-400/50',
      Business: 'bg-emerald-500/90 text-white border-emerald-400/50',
      Design: 'bg-purple-500/90 text-white border-purple-400/50',
      Development: 'bg-orange-500/90 text-white border-orange-400/50',
      Marketing: 'bg-amber-500/90 text-white border-amber-400/50',
      News: 'bg-indigo-500/90 text-white border-indigo-400/50',
      Updates: 'bg-pink-500/90 text-white border-pink-400/50',
    }
    return colors[categoryName] || 'bg-slate-500/90 text-white border-slate-400/50'
  }
</script>

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
