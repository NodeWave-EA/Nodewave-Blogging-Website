<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { useTranslation } from "~/composables/use-translation";

import type { LanguageOption } from "~/composables/use-translation";

const { currentLang, supportedLanguages, status, setLanguage, syncActiveLanguage } = useTranslation();

// State to track full page load
const isReady = ref(false);

onMounted(() => {
  syncActiveLanguage();

  if (document.readyState === "complete") {
    isReady.value = true;
  }
  else {
    window.addEventListener("load", () => {
      isReady.value = true;
      syncActiveLanguage();
    }, { once: true });

    // Fallback safeguard
    setTimeout(() => {
      isReady.value = true;
      syncActiveLanguage();
    }, 600);
  }
});

const selectedLanguage = computed<LanguageOption>({
  get: () =>
    supportedLanguages.value.find(l => l.code === currentLang.value)
    ?? supportedLanguages.value[0]
    ?? { code: "en", label: "English", icon: "i-heroicons-language" },
  set: (val: LanguageOption) => {
    if (val && val.code !== currentLang.value) {
      setLanguage(val.code);
    }
  },
});

const isLoading = computed(() => status.value !== "awaitingLoad" && status.value !== "loaded");

const tooltipText = computed(
  () => `${selectedLanguage.value.label} • Click to select preferred language`,
);
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="opacity-0 -translate-x-4"
    enter-to-class="opacity-100 translate-x-0"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="opacity-100 translate-x-0"
    leave-to-class="opacity-0 -translate-x-4"
  >
    <div
      v-if="isReady"
      class="fixed bottom-0 left-0 z-50 flex items-center notranslate"
      translate="no"
    >
      <USelectMenu
        v-model="selectedLanguage"
        :items="supportedLanguages"
        :searchable="true"
        :search-input="{ placeholder: 'Search language...', icon: 'i-heroicons-magnifying-glass-20-solid' }"
        searchable-placeholder="Search language..."
        by="code"
        option-attribute="label"
        :disabled="isLoading"
        trailing-icon=""
        aria-label="Select preferred language"
        :popper="{ placement: 'top-start', offsetDistance: 12 }"
        :ui="{
          base: 'bg-transparent shadow-none ring-0 border-0 !w-auto p-0',
          content: 'overflow-x-hidden ring-1 ring-gray-200 dark:ring-gray-800 shadow-2xl rounded-2xl bg-white dark:bg-gray-900 !w-80 sm:!w-96',
          viewport: 'max-h-[85vh] overflow-x-hidden overflow-y-auto p-1 space-y-0.5',
        }"
        class="w-auto"
      >
        <template #default="{ open }">
          <UTooltip
            :text="tooltipText"
            :popper="{ placement: 'right' }"
          >
            <UButton
              type="button"
              :aria-expanded="open"
              aria-label="Select language menu"
              class="group flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-l-none rounded-r-full bg-primary hover:bg-primary-600 text-white dark:text-gray-950 shadow-lg hover:shadow-primary/25 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer border-0 ring-0"
            >
              <UIcon
                name="i-heroicons-language"
                class="w-5 h-5 text-white dark:text-gray-950 shrink-0 transition-transform duration-300 group-hover:scale-110"
              />

              <div
                class="overflow-hidden transition-all duration-300 ease-in-out flex items-center gap-1.5"
                :class="
                  open
                    ? 'max-w-35 opacity-100 ml-1'
                    : 'max-w-0 opacity-0 group-hover:max-w-35 group-hover:opacity-100 group-hover:ml-1'
                "
              >
                <span class="text-xs font-bold whitespace-nowrap text-white dark:text-gray-950">
                  {{ selectedLanguage.label }}
                </span>
                <UIcon
                  name="i-heroicons-chevron-up-20-solid"
                  class="w-3.5 h-3.5 text-white/80 dark:text-gray-950/80 shrink-0 transition-transform duration-200"
                  :class="{ 'rotate-180': open }"
                />
              </div>
            </UButton>
          </UTooltip>
        </template>

        <template #item="{ item }">
          <div class="flex items-center gap-2.5 p-1 text-xs w-full text-left">
            <UIcon
              :name="item.code === selectedLanguage.code ? 'i-heroicons-check-20-solid' : item.icon"
              class="w-4 h-4 shrink-0 transition-colors"
              :class="item.code === selectedLanguage.code ? 'text-primary font-bold' : 'text-gray-400 dark:text-gray-500'"
            />
            <span
              class="whitespace-nowrap text-left flex-1 p-0 transition-colors"
              :class="item.code === selectedLanguage.code ? 'font-bold text-primary dark:text-primary-400' : 'font-medium text-gray-800 dark:text-gray-200'"
            >
              {{ item.label }}
            </span>
          </div>
        </template>
      </USelectMenu>
    </div>
  </Transition>
</template>
