<script setup lang="ts">
import { computed } from "vue";

import { siteConfig } from "~/app.meta";
import RssSubscribeButton from "~/components/ui/rss-subscribe-button.vue";
import { useMatrixDecrypt } from "~/composables/use-matrix-decrypt";
import { footerLinkGroups, socialLinks } from "~/constants";

defineOptions({
  name: "GlobalApplicationFooter",
});

const currentYear = computed(() => new Date().getFullYear());
const { isMotionReduced } = useReduceMotion();

const { activeHoverText, startDecryption, clearDecryption } = useMatrixDecrypt({
  speed: 25,
  revealStep: 0.35,
});

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: isMotionReduced.value ? "auto" : "smooth",
  });
}
</script>

<template>
  <UFooter aria-label="Main Footer" class="border-t-0 bg-transparent p-0 m-0">
    <div class="w-full rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_8px_24px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_16px_-2px_rgba(0,0,0,0.45),0_12px_32px_-6px_rgba(0,0,0,0.4)] overflow-hidden transition-colors duration-300">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 p-6 sm:p-8 lg:p-10">
        <!-- Brand, Bio & Quick Connect -->
        <div class="lg:col-span-5 flex flex-col justify-between gap-6">
          <div class="space-y-4">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 transition-transform duration-200 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xs"
              aria-label="Return to homepage"
            >
              <UiAppLogo letter-mode="draw" :letter-stagger="45" />
            </NuxtLink>

            <p class="font-sans text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-md">
              Deep-dives into the world of technology, software development, and the latest trends in the tech industry. Stay informed and inspired with our expert insights and analysis.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <!-- Status / Made with badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xs border border-(--app-border) bg-(--app-bg)/80 font-mono text-[10px] text-neutral-600 dark:text-neutral-300 shadow-2xs">
              <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span>
                Made with <span class="text-rose-500" aria-label="love">❤</span> by <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ siteConfig.name }}</span>
              </span>
            </div>

            <!-- Social & RSS Quick Actions -->
            <div class="inline-flex items-center gap-1.5">
              <UButton
                v-for="link in socialLinks"
                :key="link.label"
                variant="subtle"
                color="neutral"
                size="xs"
                :href="link.to"
                target="_blank"
                rel="noopener noreferrer"
                :icon="link.icon"
                class="group rounded-xs border border-(--app-border) bg-(--app-bg)/80 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-[10px] font-semibold px-2.5 py-1.5 text-neutral-700 dark:text-neutral-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary-500"
                :aria-label="`Visit ${siteConfig.name} on ${link.label}`"
              >
                <span>{{ link.label }}</span>
                <UIcon
                  name="i-lucide-arrow-up-right"
                  class="size-3 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                  aria-hidden="true"
                />
              </UButton>

              <RssSubscribeButton
                :title="siteConfig.name"
                feed-path="/rss.xml"
              />
            </div>
          </div>
        </div>

        <nav
          aria-label="Footer categorized navigation"
          class="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 lg:pl-6 lg:border-l lg:border-(--app-border)"
        >
          <div
            v-for="(group, groupIdx) in footerLinkGroups"
            :key="group.title"
            class="flex flex-col gap-3.5"
            :class="{ 'col-span-2 sm:col-span-1 pt-4 border-t border-(--app-border) sm:pt-0 sm:border-t-0': groupIdx === footerLinkGroups.length - 1 }"
          >
            <h2 class="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
              {{ group.title }}
            </h2>

            <ul class="space-y-2 p-0 m-0 list-none">
              <li v-for="link in group.links" :key="`${group.title}-${link.label}`">
                <a
                  v-if="link.external"
                  :href="link.to"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="group font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xs px-1 -ml-1 py-0.5"
                  @mouseenter="startDecryption(link.label, `footer-${group.title}-${link.label}`)"
                  @mouseleave="clearDecryption(`footer-${group.title}-${link.label}`)"
                  @focus="startDecryption(link.label, `footer-${group.title}-${link.label}`)"
                  @blur="clearDecryption(`footer-${group.title}-${link.label}`)"
                >
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 transition-colors"
                    aria-hidden="true"
                  />
                  <span>
                    {{ activeHoverText[`footer-${group.title}-${link.label}`] || link.label }}
                  </span>
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-3 shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
                    aria-hidden="true"
                  />
                </a>

                <NuxtLink
                  v-else
                  :to="link.to"
                  class="group font-mono text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-xs px-1 -ml-1 py-0.5"
                  @mouseenter="startDecryption(link.label, `footer-${group.title}-${link.label}`)"
                  @mouseleave="clearDecryption(`footer-${group.title}-${link.label}`)"
                  @focus="startDecryption(link.label, `footer-${group.title}-${link.label}`)"
                  @blur="clearDecryption(`footer-${group.title}-${link.label}`)"
                >
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="size-3.5 shrink-0 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 transition-colors"
                    aria-hidden="true"
                  />
                  <span>
                    {{ activeHoverText[`footer-${group.title}-${link.label}`] || link.label }}
                  </span>
                </NuxtLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <!-- Bottom Utility & Copyright Strip -->
      <div class="px-6 sm:px-8 lg:px-10 py-3.5 border-t border-(--app-border) bg-(--app-bg)/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-[10px]">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-neutral-500 dark:text-neutral-400">
          <span>
            &copy; {{ currentYear }} <span class="font-bold text-neutral-800 dark:text-neutral-200">{{ siteConfig.name }}</span>. All rights reserved.
          </span>
          <span class="hidden md:inline-flex items-center gap-1.5 text-neutral-400 dark:text-neutral-500">
            <span>·</span>
            <span>Press</span>
            <UKbd size="sm" class="rounded-xs bg-(--app-surface-subtle) border border-(--app-border) font-mono text-[9px]">
              /
            </UKbd>
            <span>to search</span>
          </span>
        </div>

        <button
          type="button"
          class="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/80 hover:bg-(--app-surface-hover) hover:border-primary-500/40 text-neutral-600 dark:text-neutral-300 hover:text-primary-600 dark:hover:text-primary-400 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Scroll back to top of page"
          @click="scrollToTop"
        >
          <span class="uppercase tracking-wider font-bold">Back to top</span>
          <UIcon
            name="i-lucide-arrow-up"
            class="size-3.5 group-hover:-translate-y-0.5 transition-transform duration-200"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
  </UFooter>
</template>
