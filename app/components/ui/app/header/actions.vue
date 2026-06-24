<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";

import { siteConfig } from "~/app.meta";
import { useKeyboard } from "~/composables/use-keyboard";
import { useNavigate } from "~/composables/use-navigate";

const route = useRoute();
const { navigate } = useNavigate();
const { addGlobalShortcut, removeGlobalShortcut } = useKeyboard();

const { open: openSearchPalette } = useContentSearch();

const isBlogWorkspaceRoute = computed(() => route.path.startsWith("/blog") || route.path.startsWith("/blogs"));

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
    data-aos="fade-left"
    data-aos-duration="400"
    data-aos-easing="ease-out-quad"
    data-aos-anchor="body"
  >
    <template v-if="isBlogWorkspaceRoute">
      <UTooltip
        text="Search"
        :kbds="['meta', 'K']"
        :popper="{ placement: 'bottom', strategy: 'fixed' }"
      >
        <UButton
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          class="rounded-full transition-all duration-200 active:scale-95 cursor-pointer"
          aria-label="Open documentation search palette"
          @click="openSearchPalette = true"
        />
      </UTooltip>
    </template>

    <UiAppThemeToggle />

    <UTooltip
      text="Open on GitHub"
      :kbds="['meta', 'G']"
      :popper="{ placement: 'bottom', strategy: 'fixed' }"
    >
      <UButton
        color="primary"
        variant="ghost"
        :href="siteConfig.social.github"
        target="_blank"
        rel="noopener noreferrer"
        icon="i-line-md-github-loop"
        class="rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-[0.96]"
        :aria-label="githubAriaLabel"
      />
    </UTooltip>
  </div>
</template>
