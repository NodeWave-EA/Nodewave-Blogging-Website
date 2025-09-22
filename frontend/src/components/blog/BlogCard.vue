<template>
  <article
    class="group transition-all duration-300 hover:shadow-lg hover:-translate-y-2 bg-transparent border border-border/20 rounded-xl backdrop-blur-sm hover:border-border/40">
    <router-link :to="`/blog/${post.slug}`" class="block h-full">
      <!-- Featured Image -->
      <div class="aspect-[16/9] relative overflow-hidden">
        <img v-if="getStrapiImageUrl(post.featured_image)" :src="getStrapiImageUrl(post.featured_image)!"
          :alt="getStrapiImageAlt(post.featured_image) || post.title"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <div v-else class="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <DocumentTextIcon class="w-16 h-16 text-primary-foreground/50" />
        </div>

        <!-- Gradient Overlay -->
        <div
          class="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <!-- Featured Badge -->
        <div v-if="post.featured" class="absolute top-4 left-4">
          <span
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-gradient-to-r from-amber-400 to-orange-500 text-background shadow-md">
            <StarIcon class="w-3 h-3" />
            Featured
          </span>
        </div>

        <!-- Reading Time -->
        <div class="absolute top-4 right-4">
          <span
            class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium font-mono bg-background/80 backdrop-blur-sm text-foreground border border-border/30">
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
            class="text-sm text-muted-foreground font-medium font-mono">
            {{ formatDate(post.published_at_custom || post.publishedAt) }}
          </time>
        </div>

        <!-- Title -->
        <h3
          class="text-xl font-bold font-mono text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {{ post.title }}
        </h3>

        <!-- Excerpt -->
        <p class="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed font-mono">
          {{ post.excerpt || generateExcerpt(post.content || '', 150) || 'No excerpt available.' }}
        </p>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
          <span v-for="tag in post.tags.slice(0, 3)" :key="tag.id"
            class="px-2 py-1 text-xs font-medium font-mono rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
            #{{ tag.name }}
          </span>
          <span v-if="post.tags.length > 3"
            class="px-2 py-1 text-xs font-medium font-mono rounded-md bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground">
            +{{ post.tags.length - 3 }}
          </span>
        </div>

        <!-- Author and Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-border/20">
          <!-- Author Info -->
          <div class="flex items-center gap-3">
            <img v-if="post.author && getStrapiImageUrl(post.author.profile_picture)"
              :src="getStrapiImageUrl(post.author.profile_picture)!" :alt="post.author.name"
              class="w-10 h-10 rounded-full object-cover ring-2 ring-border" />
            <UserCircleIcon v-else class="w-10 h-10 text-muted-foreground" />
            <div>
              <p class="text-sm font-semibold font-mono text-foreground">
                {{ post.author?.name || 'Anonymous' }}
              </p>
              <p class="text-xs text-muted-foreground font-mono">
                {{ post.author?.role || 'Author' }}
              </p>
            </div>
          </div>

          <!-- Engagement Stats -->
          <div class="flex items-center gap-4 text-sm text-muted-foreground">
            <div v-if="post.view_count" class="flex items-center gap-1">
              <EyeIcon class="w-4 h-4" />
              <span class="font-mono">{{ formatNumber(post.view_count) }}</span>
            </div>
            <div v-if="post.like_count" class="flex items-center gap-1">
              <HeartIcon class="w-4 h-4" />
              <span class="font-mono">{{ formatNumber(post.like_count) }}</span>
            </div>
          </div>
        </div>

        <!-- Read More Link -->
        <div class="mt-4">
          <span
            class="inline-flex items-center text-primary font-medium font-mono text-sm group-hover:text-primary/80 transition-colors">
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
</script>

<!-- No custom styles: all styling is handled by Tailwind CSS v4 classes -->
