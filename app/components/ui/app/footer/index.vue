<script setup lang="ts">
import { computed } from "vue";

import { siteConfig } from "~/app.meta";
import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";
import { navLinks, socialLinks } from "~/constants";

defineOptions({
  name: "GlobalApplicationFooter",
});

const currentYear = computed(() => new Date().getFullYear());

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}
</script>

<template>
  <UFooter aria-label="Main Footer" class="border-t-0 bg-transparent p-0 m-0">
    <!-- Grid Container -->
    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 w-full p-0 m-0">
      <!-- Box 1: Brand & Bio -->
      <div class="md:col-span-6 flex flex-col justify-between gap-6">
        <div class="space-y-4">
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-md"
            aria-label="Return to homepage"
          >
            <UiAppLogo />
          </NuxtLink>
          <p class="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-lg">
            Deep-dives into the world of technology, software development, and the latest trends in the tech industry. Stay informed and inspired with our expert insights and analysis.
          </p>
        </div>

        <!-- Status / Made with badge -->
        <div class="inline-flex items-center gap-2 self-start px-3 py-1.5 rounded-lg border border-neutral-200/50 dark:border-neutral-800/50 font-mono text-[10px] text-neutral-500">
          <span class="relative flex h-1.5 w-1.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          <span>
            Made with <span class="text-rose-500" aria-label="love">❤</span> by <span class="text-emerald-500 font-bold">{{ siteConfig.name }}</span>
          </span>
        </div>
      </div>

      <!-- Box 2 & 3 Container -->
      <div class="md:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-6">
        <!-- Box 2: Explore Navigation -->
        <div class="flex flex-col gap-4">
          <h2 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Explore
          </h2>
          <ul class="space-y-2.5">
            <li v-for="link in navLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="group font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm px-1 -ml-1"
                @mouseenter="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @mouseleave="clearDecryption(`footer-${link.label}`)"
                @focus="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @blur="clearDecryption(`footer-${link.label}`)"
              >
                <span class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-primary-500 group-focus-visible:bg-primary-500 group-hover:scale-125 transition-all duration-200" />
                <span>
                  {{ activeHoverText[`footer-${link.label}`] || link.label }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Box 3: Connect & Utility Controls -->
        <div class="flex flex-col justify-between gap-6">
          <div class="space-y-4">
            <h2 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              Connect
            </h2>
            <div class="flex flex-wrap items-center gap-2">
              <UButton
                v-for="link in socialLinks"
                :key="link.label"
                variant="subtle"
                color="neutral"
                size="sm"
                :href="link.to"
                target="_blank"
                rel="noopener noreferrer"
                :icon="link.icon"
                class="rounded-lg font-sans font-semibold tracking-wide text-[10px] px-2.5 py-1.5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
                :aria-label="`Visit our ${link.label} page`"
              >
                <UIcon
                  name="i-heroicons-arrow-up-right-20-solid"
                  class="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                />
              </UButton>

              <!-- RSS Subscribe Button -->
              <RssSubscribeButton
                title="NodeWave"
                feed-path="/rss.xml"
              />
            </div>
          </div>

          <!-- Back to top & Copyright -->
          <div class="pt-4 space-y-2 font-mono text-[10px]">
            <button
              type="button"
              class="group inline-flex items-center gap-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm"
              aria-label="Scroll back to top of page"
              @click="scrollToTop"
            >
              <span class="uppercase tracking-wider font-bold">Back to top</span>
              <UIcon name="i-lucide-arrow-up" class="h-3.5 w-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </button>

            <div class="text-neutral-400 dark:text-neutral-500">
              &copy; {{ currentYear }} <span class="font-semibold text-neutral-700 dark:text-neutral-300">{{ siteConfig.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UFooter>
</template>
