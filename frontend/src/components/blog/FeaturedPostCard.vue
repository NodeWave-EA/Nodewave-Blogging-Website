<template>
  <article :class="cardRootClass">
    <!-- HERO / FULLWIDTH -->
    <div
      v-if="variant === 'hero' || variant === 'fullwidth'"
      class="relative w-full overflow-hidden"
    >
      <!-- Blurred background -->
      <div
        v-if="lowRes && imageUrl"
        :style="{ backgroundImage: `url(${lowRes})` }"
        class="absolute inset-0 bg-center bg-cover blur-3xl scale-105 transition-opacity duration-700"
        :class="{ 'opacity-100': !loaded, 'opacity-0': loaded }"
      ></div>

      <!-- Image -->
      <router-link :to="`/blog/${post.slug}`" class="block">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="imageAlt || post.title"
          loading="lazy"
          @load="onImgLoad"
          class="relative w-full h-64 sm:h-80 md:h-[500px] object-cover transition-transform duration-700 group-hover:scale-105"
          :class="{ 'opacity-0': !loaded, 'opacity-100': loaded }"
        />
        <div
          v-else
          class="flex items-center justify-center w-full h-64 sm:h-80 md:h-[500px] bg-zinc-100 dark:bg-zinc-800"
        >
          <DocumentTextIcon class="w-20 h-20 text-zinc-400 dark:text-zinc-500" />
        </div>
      </router-link>

      <!-- Overlay gradient -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
      ></div>

      <!-- Content -->
      <div class="absolute inset-0 flex items-end md:items-center justify-center p-6 md:p-12">
        <div class="text-center max-w-3xl text-white space-y-4">
          <!-- Categories -->
          <div class="flex flex-wrap items-center justify-center gap-2 mb-3">
            <router-link
              v-for="cat in post.categories?.slice(0, 2) || []"
              :key="cat.id"
              :to="`/categories/${cat.slug}`"
              class="px-3 py-1 text-xs sm:text-sm font-medium bg-white/10 border border-white/20 rounded-full backdrop-blur-sm hover:bg-white/20 transition"
            >
              {{ cat.name }}
            </router-link>
          </div>

          <!-- Title -->
          <router-link :to="`/blog/${post.slug}`">
            <h3
              class="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg hover:underline"
            >
              {{ post.title }}
            </h3>
          </router-link>

          <!-- Excerpt -->
          <p class="text-sm sm:text-base md:text-lg text-white/90 line-clamp-3 max-w-2xl mx-auto">
            {{ post.excerpt }}
          </p>
        </div>
      </div>
    </div>

    <!-- COMPACT CARD -->
    <div
      v-else
      class="flex flex-col h-full rounded-xl overflow-hidden bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/40 dark:border-zinc-700/40 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <!-- Thumbnail -->
      <router-link :to="`/blog/${post.slug}`" class="relative aspect-[16/9] overflow-hidden block">
        <div
          v-if="lowRes && imageUrl"
          :style="{ backgroundImage: `url(${lowRes})` }"
          class="absolute inset-0 bg-center bg-cover blur-2xl scale-105 transition-opacity duration-700"
          :class="{ 'opacity-100': !loaded, 'opacity-0': loaded }"
        ></div>

        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="imageAlt || post.title"
          loading="lazy"
          @load="onImgLoad"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          :class="{ 'opacity-0': !loaded, 'opacity-100': loaded }"
        />
        <div
          v-else
          class="flex items-center justify-center w-full h-full bg-zinc-100 dark:bg-zinc-800"
        >
          <DocumentTextIcon class="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
        </div>
      </router-link>

      <!-- Card Body -->
      <div class="p-5 flex flex-col flex-grow">
        <!-- Categories & Date -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <router-link
              v-for="category in post.categories?.slice(0, 1) || []"
              :key="category.id"
              :to="`/categories/${category.slug}`"
              class="px-2 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100/70 dark:bg-zinc-800/70 rounded-full hover:bg-zinc-200/80"
            >
              {{ category.name }}
            </router-link>
          </div>
          <time :datetime="getPostDateISO(post)" class="text-xs text-zinc-500 dark:text-zinc-400">
            {{ formatDate(post) }}
          </time>
        </div>

        <!-- Title -->
        <router-link :to="`/blog/${post.slug}`">
          <h4
            class="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 hover:text-blue-600"
          >
            {{ post.title }}
          </h4>
        </router-link>

        <!-- Excerpt -->
        <p class="text-sm text-zinc-600 dark:text-zinc-300 line-clamp-3 flex-grow">
          {{ post.excerpt || 'No excerpt.' }}
        </p>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="mt-3 flex flex-wrap gap-2">
          <router-link
            v-for="tag in post.tags.slice(0, 3)"
            :key="tag.id"
            :to="`/tag/${tag.slug}`"
            class="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-800/60 rounded hover:bg-zinc-200/70"
          >
            #{{ tag.name }}
          </router-link>
          <span
            v-if="post.tags.length > 3"
            class="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-300 bg-zinc-100/60 dark:bg-zinc-800/60 rounded"
          >
            +{{ post.tags.length - 3 }}
          </span>
        </div>

        <!-- Footer -->
        <div
          class="pt-5 mt-auto flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50"
        >
          <!-- Author -->
          <router-link
            v-if="post.author"
            :to="`/author/${post.author.slug}`"
            class="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-3 mt-3 hover:text-blue-600"
          >
            <img
              v-if="post.author?.avatar && imageAuthUrl"
              :src="imageAuthUrl"
              :alt="post.author?.name"
              class="w-8 h-8 rounded-full object-cover"
            />
            <span>{{ post.author?.name || 'Anonymous' }}</span>
          </router-link>

          <!-- Reading time -->
          <div class="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2 mt-3">
            <svg
              class="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            <span>{{ post.reading_time || 4 }} min read</span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>

<script lang="ts" setup>
import { usePostMetricsStore } from '@/stores/postMetrics'
import type { BlogPost } from '@/types'
import { formatDate, getPostDateISO } from '@/utils/format'
import { getStrapiImageAltText, getStrapiImageUrl } from '@/utils/strapi'
import { DocumentTextIcon } from '@heroicons/vue/24/outline'
import { computed, ref } from 'vue'

const props = defineProps<{
  post: BlogPost
  variant?: 'compact' | 'hero' | 'fullwidth'
}>()

const post = props.post
const variant = props.variant || 'compact'

const loaded = ref(false)
function onImgLoad() {
  loaded.value = true
}

const imageUrl = computed(() => getStrapiImageUrl(post.featured_image as any))
const imageAlt = computed(() => getStrapiImageAltText(post.featured_image as any))
const lowRes = computed(() => {
  const i = (post.featured_image as any) || null
  if (!i) return null
  const candidate =
    (i.formats && (i.formats.small?.url || i.formats.thumbnail?.url)) || i.previewUrl || i.url
  if (!candidate) return null
  if (candidate.startsWith('/')) {
    return (import.meta.env.VITE_STRAPI_BASE_URL || 'http://localhost:1337') + candidate
  }
  return candidate
})

const imageAuthUrl = computed(() => {
  const a = (post.author as any)?.avatar || null
  if (!a) return null
  const url = getStrapiImageUrl(a)
  return url
})

const metricsStore = usePostMetricsStore()

const cardRootClass = computed(() => {
  if (variant === 'hero' || variant === 'fullwidth') {
    return 'group rounded-2xl overflow-hidden shadow-2xl'
  }
  return 'group rounded-xl overflow-hidden transition-all duration-300 bg-transparent'
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

.line-clamp-4 {
  display: -webkit-box;
  -webkit-line-clamp: 4;
  line-clamp: 4;
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
</style>
