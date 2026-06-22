<script setup lang="ts">
import { siteConfig } from "~/app.meta";
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader class="m-2">
        <template #headline>
          <div class="inline-flex items-center gap-1.5 text-primary-500 dark:text-primary-400">
            <UIcon name="i-lucide-sparkle" class="h-3 w-3" />
            <span class="font-mono text-[9px] font-bold uppercase tracking-[0.15em]">
              Curated Posts & Insights
            </span>
          </div>
        </template>

        <template #title>
          <h1 id="featured-heading" class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15]">
            Explore the <span class="gradient-text">latest curated posts</span> and insights from <span class="gradient-text">nodewave</span> and stay ahead in the world of technology and development.
          </h1>
        </template>

        <template #description>
          <p class="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-600 dark:text-neutral-400">
            Discover a wealth of knowledge and inspiration through our curated collection of posts and insights. Stay informed, gain valuable perspectives, and fuel your passion for technology and development with our carefully selected content.
          </p>
        </template>

        <template #links>
          <div
            v-for="socialLink in siteConfig.socialLinks"
            :key="socialLink.url"
            class="flex flex-wrap gap-2"
          >
            <UButton
              :href="socialLink.url"
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="sm"
              class="flex items-center gap-1.5"
            >
              <UIcon :name="socialLink.icon" class="h-4 w-4" />
              {{ socialLink.platform.charAt(0).toUpperCase() + socialLink.platform.slice(1) }}
            </UButton>
          </div>
        </template>

        <template #default>
          <div class="pt-1 flex flex-wrap items-center gap-3">
            <NuxtLink
              to="#"
              class="group inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 px-4 py-2 text-xs font-semibold tracking-wide text-white dark:text-neutral-950 transition-all hover:-translate-y-0.5"
            >
              View All Updates
              <UIcon
                name="i-line-md-arrow-right"
                class="h-3 w-3 text-neutral-400 dark:text-neutral-500 group-hover:text-white dark:group-hover:text-neutral-950 group-hover:translate-x-0.5 transition-all"
              />
            </NuxtLink>

            <NuxtLink
              to="#"
              class="inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200/60 hover:border-neutral-300 dark:border-neutral-800/60 dark:hover:border-neutral-700 bg-white/10 dark:bg-neutral-900/10 px-4 py-2 text-xs font-medium tracking-wide text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all"
            >
              <UIcon name="i-line-md-grid-3-filled" class="h-3.5 w-3.5 text-neutral-400" />
              Explore Categories
            </NuxtLink>
          </div>
        </template>
      </UPageHeader>
    </UPage>
  </UContainer>
</template>
