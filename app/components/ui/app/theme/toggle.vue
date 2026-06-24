<script lang="ts" setup>
import { onMounted, ref } from "vue";

const mounted = ref(false);
const colorMode = useColorMode();

const { newTheme, currentIcon, startViewTransition } = useTheme();
const { addGlobalShortcut } = useKeyboard();

onMounted(() => {
  mounted.value = true;

  addGlobalShortcut("shift+t", (e: KeyboardEvent) => {
    startViewTransition(e);
  });
});
</script>

<template>
  <ClientOnly fallback-tag="span">
    <div class="relative inline-flex items-center justify-center shrink-0">
      <span
        v-if="mounted"
        class="sr-only"
      >
        Current theme configuration: {{ colorMode.preference }}
      </span>

      <UTooltip
        :text="`Switch to ${newTheme} mode`"
        :kbds="['Shift+T']"
        :popper="{ placement: 'top' }"
      >
        <UButton
          type="button"
          :aria-label="`Switch to ${newTheme} mode`"
          :icon="currentIcon"
          variant="ghost"
          size="md"
          class="group relative rounded-full cursor-pointer bg-transparent text-current hover:bg-primary-50/60 dark:hover:bg-primary-950/30 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950 transition-all duration-300 hover:scale-[1.03] active:scale-[0.96]"
          @click="startViewTransition"
        >
          <span class="absolute inset-0 rounded-full ring-2 ring-primary-500/0 opacity-0 transition-all duration-300 group-hover:ring-primary-500/10 group-hover:opacity-100" />
        </UButton>

        <template #fallback>
          <UButton
            type="button"
            aria-label="Loading local theme engine states"
            icon="i-line-md-loading-twotone-loop"
            variant="ghost"
            size="md"
            class="rounded-full bg-transparent text-current opacity-50 pointer-events-none"
          />
        </template>
      </UTooltip>
    </div>
    <template #fallback>
      <UButton
        type="button"
        aria-label="Loading local theme engine states"
        icon="i-line-md-loading-twotone-loop"
        variant="ghost"
        size="md"
        class="rounded-full bg-transparent text-current opacity-50 pointer-events-none"
      />
    </template>
  </ClientOnly>
</template>

<style scoped>
:deep(.group:hover .i-line-md-sunny-filled-loop),
:deep(.group:hover .i-line-md-moon-filled-loop) {
  transform: scale(1.1) rotate(12deg);
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

:deep(.i-line-md-sunny-filled-loop),
:deep(.i-line-md-moon-filled-loop) {
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
