<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

import { siteConfig } from "~/app.meta";
import { useKeyboard } from "~/composables/use-keyboard";
import { useNavigate } from "~/composables/use-navigate";

const { navigate } = useNavigate();
const { isMotionReduced } = useReduceMotion();
const { addGlobalShortcut, removeGlobalShortcut } = useKeyboard();
const { open: openSearchPalette } = useContentSearch();

const githubAriaLabel = `Open ${siteConfig.name} on GitHub`;

onMounted(() => {
  addGlobalShortcut("meta+g", () => {
    navigate({
      href: siteConfig.social.github,
      external: true,
      rel: "noopener noreferrer",
    });
  });

  addGlobalShortcut("/", () => {
    navigateTo("/search");
  });
});

onUnmounted(() => {
  if (typeof removeGlobalShortcut === "function") {
    removeGlobalShortcut("meta+g");
    removeGlobalShortcut("/");
  }
});
</script>

<template>
  <div
    class="flex items-center gap-1.5"
    :data-aos="!isMotionReduced ? 'fade-left' : undefined"
    data-aos-duration="400"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <!-- Search Trigger -->
    <UTooltip
      text="Search"
      :kbds="['meta', 'K']"
      :popper="{ placement: 'bottom', strategy: 'fixed' }"
    >
      <UButton
        icon="i-line-md-file-search"
        color="neutral"
        variant="ghost"
        size="sm"
        class="rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-surface-hover) text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
        aria-label="Open documentation search palette"
        @click="openSearchPalette = true"
      />
    </UTooltip>

    <!-- Color Mode Toggle -->
    <UiAppThemeToggle />

    <!-- GitHub External Link -->
    <UTooltip
      text="Open on GitHub"
      :kbds="['meta', 'G']"
      :popper="{ placement: 'bottom', strategy: 'fixed' }"
    >
      <UButton
        color="primary"
        variant="ghost"
        size="sm"
        :href="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-line-md-github-loop"
        class="group rounded-xs border border-transparent hover:border-(--app-border) hover:bg-(--app-surface-hover) transition-colors"
        :aria-label="githubAriaLabel"
      >
        <UIcon
          name="i-lucide-arrow-up-right"
          class="size-3.5 shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200"
          aria-hidden="true"
        />
      </UButton>
    </UTooltip>
  </div>
</template>
