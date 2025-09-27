<template>
  <article class="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-slate-700/60
           shadow-lg hover:shadow-2xl hover:shadow-blue-500/10
           bg-white/80 dark:bg-slate-900/60 backdrop-blur-md
           transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]
           max-w-3xl mx-auto">

    <!-- Glow Overlay (non-blocking) -->
    <div class="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5
             opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none">
    </div>

    <!-- Featured Image (only image clickable) -->
    <div class="relative aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
      <router-link :to="`/blog/${post.slug}`" class="block">
        <!-- Always render the image; getStrapiImageUrl will return a placeholder when the image is missing -->
        <img :src="getStrapiImageUrl(post.featured_image)!"
          :alt="getStrapiImageAltText(post.featured_image) || post.title"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, (max-width: 1024px) 50vw, 33vw" />
      </router-link>

      <!-- Gradient Overlay (non-blocking) -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent pointer-events-none">
      </div>

      <!-- Featured Badge -->
      <div v-if="post.featured" class="absolute top-3 left-3 z-20">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full
                   text-white bg-gradient-to-r from-amber-500 to-yellow-500 shadow-lg">
          <StarIcon class="w-4 h-4" />
          Featured
        </span>
      </div>

      <!-- Reading Time -->
      <div class="absolute top-3 right-3 z-20">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm font-medium
                   bg-white/80 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 shadow-lg backdrop-blur-sm">
          <ClockIcon class="w-4 h-4" />
          {{ post.reading_time || calculateReadingTime(post.content) || 5 }} min
        </span>
      </div>

      <!-- Categories (clickable) -->
      <div class="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 z-20">
        <router-link v-for="category in post.categories?.slice(0, 2) || []" :key="category.id"
          :to="`/category/${category.slug || category.id}`" :class="[
            'px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-md border shadow-md hover:scale-105 transition',
            getCategoryOverlayStyle(category.name)
          ]">
          {{ category.name }}
        </router-link>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6 lg:p-7 relative z-20">
      <!-- Date -->
      <time :datetime="post.published_at_custom || post.publishedAt"
        class="inline-flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
        {{ formatDate(post.published_at_custom || post.publishedAt) }}
      </time>

      <!-- Title (clickable) -->
      <router-link :to="`/blog/${post.slug}`">
        <h3 class="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 dark:text-white mb-3 line-clamp-2
                 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          {{ post.title }}
        </h3>
      </router-link>

      <!-- Excerpt -->
      <p class="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 mb-5 leading-relaxed">
        {{ post.excerpt || generateExcerpt(post.content || '', 150) || 'No excerpt available.' }}
      </p>

      <!-- Tags (clickable) -->
      <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-5">
        <router-link v-for="tag in post.tags.slice(0, 3)" :key="tag.id" :to="`/tag/${tag.slug || tag.id}`" class="px-2.5 py-1 text-xs font-medium rounded-full
                 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300
                 hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          #{{ tag.name }}
        </router-link>
        <span v-if="post.tags.length > 3" class="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800
                 text-slate-600 dark:text-slate-400">
          +{{ post.tags.length - 3 }}
        </span>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between pt-5 border-t border-slate-200 dark:border-slate-700">
        <!-- Author (clickable) -->
        <div v-if="post.author" class="flex items-center gap-3">
          <router-link :to="`/author/${post.author.slug || post.author.id}`" class="flex items-center gap-3">
            <!-- If author exists but has no avatar, getStrapiImageUrl will return the placeholder avatar URL -->
            <img :src="getStrapiImageUrl(post.author?.avatar)!" :alt="post.author?.name || 'Author'"
              class="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600" />
            <div>
              <p
                class="text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400">
                {{ post.author?.name }}
              </p>
            </div>
          </router-link>
        </div>

        <!-- Views & Likes -->
        <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span v-if="(post.view_count ?? 0) > 0" class="flex items-center gap-1">
            <EyeIcon class="w-4 h-4" />
            {{ formatNumber(post.view_count ?? 0) }}
          </span>
          <span v-if="(post.like_count ?? 0) > 0" class="flex items-center gap-1">
            <HeartIcon class="w-4 h-4" />
            {{ formatNumber(post.like_count ?? 0) }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
  import type { BlogPost } from '@/types';
  import { generateExcerpt } from '@/utils/contentRenderer';
  import { calculateReadingTime, formatDate, formatNumber } from '@/utils/format';
  import { getStrapiImageAltText, getStrapiImageUrl } from '@/utils/strapi';
  import {
    ClockIcon,
    EyeIcon,
    HeartIcon,
    StarIcon,
  } from '@heroicons/vue/24/outline';

  interface Props {
    post: BlogPost
  }

  defineProps<Props>()

  // Category color mapping for visual distinction (returns Tailwind classes only)

  // Category overlay style for image overlay
  const getCategoryOverlayStyle = (categoryName: string): string => {
    const colors: Record<string, string> = {
      Technology: 'bg-transparent text-white border-blue-400/50',
      Business: 'bg-transparent text-white border-emerald-400/50',
      Design: 'bg-transparent text-white border-purple-400/50',
      Development: 'bg-transparent text-white border-orange-400/50',
      Marketing: 'bg-transparent text-white border-amber-400/50',
      News: 'bg-transparent text-white border-indigo-400/50',
      Updates: 'bg-transparent text-white border-pink-400/50',
    }
    return colors[categoryName] || 'bg-transparent text-white border-slate-400/50'
  }
</script>

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
