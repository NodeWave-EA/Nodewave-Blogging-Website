<template>
  <div :class="['relative backdrop-blur-xl overflow-hidden', containerPadding]">
    <div class="relative z-10 container mx-auto px-4 text-center">
      <div class="max-w-4xl mx-auto">
        <!-- Breadcrumb or Badge -->
        <div :class="['mb-4', badgeWrapperAnim]" data-aos="fade-down">
          <span
            :class="[
              'inline-flex items-center rounded-full bg-blue-100/80 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-semibold backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/50',
              badgePadding,
              badgeText,
            ]"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ tag }}
          </span>
        </div>

        <!-- Main Title -->
        <h1 :class="[titleSize, 'font-black', titleMargin]" data-aos="fade-up" data-aos-delay="100">
          <span
            class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent leading-tight"
          >
            {{ title }}
          </span>
        </h1>

        <!-- Description -->
        <p
          v-if="description"
          :class="[
            descSize,
            'text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium',
          ]"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {{ description }}
        </p>

        <!-- Decorative Line -->
        <div
          :class="['mt-6 flex justify-center', lineAnim]"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <div
            :class="[
              'h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 rounded-full',
              lineWidth,
            ]"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
interface Props {
  tag?: string
  title: string
  description?: string
  /** 'compact' | 'regular' | 'large' — default compact to reduce header height */
  size?: 'compact' | 'regular' | 'large'
}

const props = withDefaults(defineProps<Props>(), { size: 'compact' })

const isCompact = computed(() => props.size === 'compact')
const isRegular = computed(() => props.size === 'regular')

const containerPadding = computed(() =>
  isCompact.value ? 'py-8' : isRegular.value ? 'py-12' : 'py-20',
)
const titleSize = computed(() =>
  isCompact.value
    ? 'text-3xl md:text-5xl'
    : isRegular.value
      ? 'text-4xl md:text-6xl'
      : 'text-5xl md:text-7xl',
)
const descSize = computed(() =>
  isCompact.value
    ? 'text-base md:text-lg'
    : isRegular.value
      ? 'text-lg md:text-xl'
      : 'text-xl md:text-2xl',
)
const titleMargin = computed(() => (isCompact.value ? 'mb-4' : 'mb-6'))
const badgePadding = computed(() => (isCompact.value ? 'px-3 py-1' : 'px-4 py-2'))
const badgeText = computed(() => (isCompact.value ? 'text-sm' : 'text-sm'))
const lineWidth = computed(() => (isCompact.value ? 'w-16' : isRegular.value ? 'w-20' : 'w-24'))
const badgeWrapperAnim = computed(() => (isCompact.value ? '' : ''))
const lineAnim = computed(() => (isCompact.value ? '' : ''))
</script>
