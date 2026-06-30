<script setup lang="ts">
import { computed } from "vue";

import { siteConfig } from "~/app.meta";
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
  <UFooter
    class="relative w-full border-t border-neutral-200/40  mt-24 transition-all duration-300 select-none"
    aria-label="Main Footer"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 pb-10 border-b border-neutral-200/50 dark:border-neutral-800/40">
        <div class="md:col-span-5 flex flex-col items-start gap-4">
          <div class="flex items-center gap-2 transition-transform duration-200 hover:scale-[1.01]">
            <UiAppLogo />
          </div>
          <p class="font-sans text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed">
            Deep-dives into the world of technology, software development, and the latest trends in the tech industry. Stay informed and inspired with our expert insights and analysis.
          </p>
        </div>

        <div class="md:col-span-3 md:col-start-7 flex flex-col gap-3.5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Explore
          </p>
          <ul class="space-y-2.5">
            <li v-for="link in navLinks" :key="link.label">
              <NuxtLink
                :to="link.to"
                class="group font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2"
                @mouseenter="startDecryption(`${link.label}`, `footer-${link.label}`)"
                @mouseleave="clearDecryption(`footer-${link.label}`)"
              >
                <span class="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700 group-hover:bg-primary-500 group-hover:scale-125 transition-all duration-200" />
                <span>
                  {{ activeHoverText[`footer-${link.label}`] || link.label }}
                </span>
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div class="md:col-span-3 flex flex-col gap-3.5">
          <p class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            Connect
          </p>

          <div class="flex flex-wrap items-center gap-2">
            <UButton
              v-for="link in socialLinks"
              :key="link.label"
              variant="subtle"
              color="neutral"
              size="sm"
              :href="link.to"
              target="_blank"
              :icon="link.icon"
              class="rounded-lg font-sans font-semibold tracking-wide text-[10px] px-2.5 py-1.5 hover:border-neutral-300 dark:hover:border-neutral-700 hover:text-primary-500 dark:hover:text-primary-400 transition-all duration-200"
              :aria-label="`Join our system hub channel at ${link.label}`"
            />
          </div>
        </div>
      </div>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500">
        <div class="flex items-center gap-1.5 order-2 sm:order-1 tracking-tight">
          <span>&copy;</span>
          <span>{{ currentYear }}</span>
          <span class="text-neutral-700 dark:text-neutral-300 font-semibold">{{ siteConfig.name }}</span>
          <span class="text-neutral-300 dark:text-neutral-800">|</span>
          <span class="text-[9px] text-neutral-400/70 dark:text-neutral-500/60 uppercase tracking-widest">
            {{ siteConfig.tagLine }}
          </span>
        </div>

        <div class="flex items-center gap-4 order-1 sm:order-2">
          <div class="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/60">
            <span class="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
            <span class="text-[9px] uppercase tracking-wider text-neutral-500 font-bold">
              Made with <span class="text-rose-500">❤</span> by the <span class="text-emerald-500">{{ siteConfig.name }}</span> Team
            </span>
          </div>

          <button
            type="button"
            class="group inline-flex items-center gap-1 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors cursor-pointer"
            @click="scrollToTop"
          >
            <span>Back to top</span>
            <UIcon name="i-lucide-arrow-up" class="h-3 w-3 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  </UFooter>
</template>
