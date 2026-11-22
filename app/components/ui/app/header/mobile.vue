<script setup lang="ts">
import { nextTick, onMounted } from "vue";

import { siteConfig } from "~/app.meta";
import { isNavLinkActive } from "~/composables/use-nav-bubble";
import { navLinks } from "~/constants";

const emit = defineEmits<{
  navigate: [];
}>();

const route = useRoute();
const { isMotionReduced } = useReduceMotion();
const { open: openSearchPalette } = useContentSearch();
const { $refreshAos } = useNuxtApp();

onMounted(async () => {
  await nextTick();
  $refreshAos?.();
});

function handleOpenSearch() {
  emit("navigate");
  openSearchPalette.value = true;
}
</script>

<template>
  <div class="w-full h-full flex flex-col justify-between gap-6 select-none">
    <!-- Primary Route List -->
    <nav aria-label="Mobile viewport navigation menu" class="w-full space-y-2.5">
      <p class="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        Navigation
      </p>

      <ul class="space-y-1 w-full p-1.5 m-0 list-none rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)]">
        <li
          v-for="(link, idx) in navLinks"
          :key="link.to"
          class="w-full"
          :data-aos="!isMotionReduced ? 'fade-right' : undefined"
          :data-aos-delay="idx * 40"
          data-aos-duration="280"
          data-aos-easing="ease-out-quad"
        >
          <NuxtLink
            :to="link.to"
            :aria-current="isNavLinkActive(link.to, route.path) ? 'page' : undefined"
            class="group flex w-full items-center justify-between gap-3 px-3.5 py-3 rounded-xs border font-mono text-xs uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            :class="
              isNavLinkActive(link.to, route.path)
                ? 'bg-(--app-bg) text-primary-600 dark:text-primary-400 border-(--app-border) font-bold shadow-2xs'
                : 'border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-(--app-surface-hover) hover:border-(--app-border) hover:text-neutral-900 dark:hover:text-white font-medium'
            "
            @click="emit('navigate')"
          >
            <span class="flex items-center gap-3 min-w-0">
              <UIcon
                v-if="link.icon"
                :name="link.icon"
                class="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110"
                :class="
                  isNavLinkActive(link.to, route.path)
                    ? 'text-primary-500'
                    : 'text-neutral-500 dark:text-neutral-400 group-hover:text-primary-500'
                "
                aria-hidden="true"
              />
              <span class="truncate">{{ link.label }}</span>
            </span>

            <UIcon
              name="i-lucide-chevron-right"
              class="size-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              :class="
                isNavLinkActive(link.to, route.path)
                  ? 'text-primary-500 opacity-100'
                  : 'opacity-45 group-hover:opacity-90'
              "
              aria-hidden="true"
            />
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- Bottom Quick Utilities -->
    <div class="pt-4 border-t border-(--app-border) space-y-2.5">
      <p class="px-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
        Quick Actions
      </p>

      <button
        type="button"
        class="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-xs text-neutral-700 dark:text-neutral-200 shadow-2xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        @click="handleOpenSearch"
      >
        <span class="flex items-center gap-2.5">
          <UIcon
            name="i-line-md-file-search"
            class="size-4 text-primary-500 shrink-0"
            aria-hidden="true"
          />
          <span>Quick Search</span>
        </span>
        <UKbd
          value="⌘K"
          size="sm"
          class="hidden sm:inline-flex"
        />
      </button>

      <div class="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 font-mono text-xs text-neutral-700 dark:text-neutral-200 shadow-2xs">
        <span class="flex items-center gap-2.5">
          <UIcon
            name="i-lucide-contrast"
            class="size-4 text-primary-500 shrink-0"
            aria-hidden="true"
          />
          <span>Appearance</span>
        </span>
        <UiAppThemeToggle />
      </div>

      <NuxtLink
        :to="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        class="group flex items-center justify-between gap-3 px-3.5 py-3 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 hover:bg-(--app-surface-hover) hover:border-primary-500/40 font-mono text-xs text-neutral-700 dark:text-neutral-200 shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        @click="emit('navigate')"
      >
        <span class="flex items-center gap-2.5">
          <UIcon
            name="i-line-md-github-loop"
            class="size-4 text-primary-500 shrink-0"
            aria-hidden="true"
          />
          <span>GitHub Repository</span>
        </span>
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-3.5 text-neutral-400 group-hover:text-primary-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
          aria-hidden="true"
        />
      </NuxtLink>
    </div>
  </div>
</template>
