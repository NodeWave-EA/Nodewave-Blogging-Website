<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

import { useTranslation } from "~/composables/use-translation";

import type { LanguageOption } from "~/composables/use-translation";

defineOptions({
  name: "AppLangSwitcher",
});

const {
  currentLang,
  supportedLanguages,
  status,
  setLanguage,
  preloadTranslate,
  syncActiveLanguage,
} = useTranslation();

const isReady = ref(false);
let idleHandle: number | ReturnType<typeof setTimeout> | null = null;

function revealSwitcher() {
  if (isReady.value) {
    return;
  }
  const show = () => {
    isReady.value = true;
    syncActiveLanguage();
  };

  if (typeof window.requestIdleCallback === "function") {
    idleHandle = window.requestIdleCallback(show, { timeout: 1500 });
  }
  else {
    idleHandle = setTimeout(show, 150);
  }
}

onMounted(() => {
  syncActiveLanguage();

  if (document.readyState === "complete") {
    revealSwitcher();
  }
  else {
    window.addEventListener("load", revealSwitcher, { once: true });
  }
});

onUnmounted(() => {
  window.removeEventListener("load", revealSwitcher);
  if (idleHandle !== null) {
    if (typeof window.cancelIdleCallback === "function" && typeof idleHandle === "number") {
      window.cancelIdleCallback(idleHandle);
    }
    else {
      clearTimeout(idleHandle);
    }
    idleHandle = null;
  }
});

const selectedLanguage = computed<LanguageOption>({
  get: () =>
    supportedLanguages.value.find(l => l.code === currentLang.value)
    ?? supportedLanguages.value[0]
    ?? { code: "en", label: "English", icon: "i-lucide-globe" },
  set: (val: LanguageOption) => {
    if (val && val.code !== currentLang.value) {
      setLanguage(val.code);
    }
  },
});

const isLoading = computed(() => status.value === "loading");

const shortCode = computed(() => (selectedLanguage.value.code || "en").toUpperCase());

const tooltipText = computed(
  () => `${selectedLanguage.value.label} (${shortCode.value}) · Select preferred language`,
);
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="isReady"
      class="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-50 flex items-center notranslate"
      translate="no"
      @pointerenter="preloadTranslate"
    >
      <USelectMenu
        v-model="selectedLanguage"
        :items="supportedLanguages"
        :search-input="{
          placeholder: 'Filter languages...',
          icon: 'i-lucide-search',
        }"
        by="code"
        label-key="label"
        :disabled="isLoading"
        trailing-icon=""
        aria-label="Select preferred language"
        :content="{
          align: 'start',
          side: 'top',
          sideOffset: 8,
        }"
        :ui="{
          base: 'bg-transparent shadow-none ring-0 border-0 !w-auto p-0',
          content: 'overflow-x-hidden rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/95 dark:bg-(--app-surface-subtle)/95 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_10px_28px_-4px_rgba(0,0,0,0.14),0_18px_40px_-8px_rgba(0,0,0,0.1)] dark:shadow-[0_14px_32px_-4px_rgba(0,0,0,0.65),0_22px_44px_-8px_rgba(0,0,0,0.5)] !w-72 sm:!w-80',
          viewport: 'max-h-[65vh] overflow-x-hidden overflow-y-auto p-1 space-y-0.5',
          item: 'rounded-xs font-mono text-xs transition-colors data-highlighted:bg-(--app-surface-hover)',
        }"
        class="w-auto"
      >
        <template #default="{ open }">
          <UTooltip
            :text="tooltipText"
            :content="{ side: 'right', sideOffset: 8 }"
          >
            <button
              type="button"
              :disabled="isLoading"
              :aria-expanded="open"
              :aria-busy="isLoading"
              aria-label="Select preferred language"
              class="group inline-flex items-center gap-2 h-9 px-2.5 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] text-neutral-800 dark:text-neutral-200 hover:bg-(--app-surface-hover)/95 hover:border-primary-500/40 transition-all duration-200 ease-out cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60 disabled:cursor-wait"
              :class="{ 'border-primary-500/50 bg-(--app-surface-hover)': open }"
              @focus="preloadTranslate"
            >
              <span
                class="inline-flex items-center justify-center size-5 rounded-xs bg-primary-500/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 shrink-0"
              >
                <UIcon
                  v-if="isLoading"
                  name="i-lucide-loader"
                  class="size-3.5 animate-spin"
                  aria-hidden="true"
                />
                <UIcon
                  v-else
                  name="i-lucide-languages"
                  class="size-3.5 transition-transform duration-200 group-hover:scale-105"
                  aria-hidden="true"
                />
              </span>

              <span
                class="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100"
              >
                {{ shortCode }}
              </span>

              <span
                class="overflow-hidden transition-all duration-250 ease-out flex items-center gap-1.5"
                :class="
                  open
                    ? 'max-w-36 opacity-100'
                    : 'max-w-0 opacity-0 group-hover:max-w-36 group-hover:opacity-100 group-focus-visible:max-w-36 group-focus-visible:opacity-100'
                "
              >
                <span class="text-neutral-300 dark:text-neutral-700 select-none" aria-hidden="true">·</span>
                <span
                  class="font-mono text-[11px] font-medium whitespace-nowrap text-neutral-600 dark:text-neutral-300"
                >
                  {{ selectedLanguage.label }}
                </span>
              </span>

              <UIcon
                name="i-lucide-chevron-up"
                class="size-3.5 text-neutral-500 dark:text-neutral-400 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180 text-primary-500': open }"
                aria-hidden="true"
              />
            </button>
          </UTooltip>
        </template>

        <template #item="{ item }">
          <div class="flex items-center justify-between gap-2.5 py-1 px-1.5 w-full text-left font-mono text-xs">
            <div class="flex items-center gap-2 min-w-0">
              <UIcon
                :name="item.code === selectedLanguage.code ? 'i-lucide-check' : (item.icon || 'i-lucide-globe')"
                class="size-3.5 shrink-0 transition-colors"
                :class="
                  item.code === selectedLanguage.code
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-neutral-400 dark:text-neutral-500'
                "
                aria-hidden="true"
              />
              <span
                class="truncate transition-colors"
                :class="
                  item.code === selectedLanguage.code
                    ? 'font-bold text-primary-600 dark:text-primary-400'
                    : 'font-medium text-neutral-800 dark:text-neutral-200'
                "
              >
                {{ item.label }}
              </span>
            </div>

            <span
              class="px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase tracking-wider border shrink-0"
              :class="
                item.code === selectedLanguage.code
                  ? 'bg-primary-500/10 border-primary-500/25 text-primary-600 dark:text-primary-400'
                  : 'bg-(--app-bg) border-(--app-border) text-neutral-500 dark:text-neutral-400'
              "
            >
              {{ item.code }}
            </span>
          </div>
        </template>
      </USelectMenu>
    </div>
  </Transition>
</template>
