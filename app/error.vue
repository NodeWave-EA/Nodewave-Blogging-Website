<script setup lang="ts">
import { siteConfig } from "~/app.meta";

defineOptions({
  name: "AppErrorPage",
});

const error = useError();
const runtimeConfig = useRuntimeConfig().public;

const isDev = import.meta.dev;
const copied = ref(false);

const siteName = computed(() => runtimeConfig.siteName || siteConfig.name || "NodeWave");
const currentYear = new Date().getUTCFullYear();

const statusCode = computed(() => Number(error.value?.statusCode) || 500);
const is404 = computed(() => statusCode.value === 404);
const isClientError = computed(() => statusCode.value >= 400 && statusCode.value < 500);

const statusLabel = computed(() => {
  if (error.value?.statusMessage)
    return error.value.statusMessage;
  if (is404.value)
    return "Not Found";
  if (statusCode.value === 403)
    return "Access Denied";
  if (isClientError.value)
    return "Bad Request";
  return "Internal System Error";
});

const errorTitle = computed(() => {
  if (is404.value)
    return "Page Not Found";
  if (statusCode.value === 403)
    return "Access Restricted";
  if (isClientError.value)
    return "Unable to Process Request";
  return "Unexpected System Error";
});

const errorDescription = computed(() => {
  const detail = error.value?.message?.trim();
  const statusMsg = error.value?.statusMessage?.trim();

  if (detail && detail !== statusMsg && !detail.startsWith("Cannot find any path")) {
    return detail;
  }

  if (is404.value) {
    return "The requested page or article could not be located. It may have been moved, renamed, or removed from the archive.";
  }

  return "An unexpected error occurred while rendering this page. You can retry the request or return to the main archive.";
});

const requestedPath = computed(() => {
  const url = error.value?.url;
  return typeof url === "string" && url.length > 0
    ? url
    : "";
});

const formattedTrace = computed(() => {
  if (!error.value)
    return "";
  if (error.value.stack)
    return error.value.stack;
  return JSON.stringify(error.value, null, 2);
});

function handleRedirect(path: string) {
  clearError({ redirect: path });
}

function handleRetry() {
  clearError();
}

async function copyTrace() {
  if (!formattedTrace.value || !import.meta.client)
    return;
  try {
    await navigator.clipboard.writeText(formattedTrace.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  }
  catch {
    copied.value = false;
  }
}

useSeoMeta({
  title: () => `${statusCode.value} — ${errorTitle.value} | ${siteName.value}`,
  description: () => errorDescription.value,
  robots: "noindex, nofollow",
});
</script>

<template>
  <UApp>
    <div class="min-h-dvh flex flex-col justify-between bg-(--app-bg) text-neutral-900 dark:text-neutral-100 min-w-0 overflow-x-clip selection:bg-primary-500/15">
      <!-- App Header -->
      <header class="sticky top-0 z-50 pt-2.5 pb-1 px-3 sm:px-6 lg:px-8">
        <div class="max-w-(--ui-container) mx-auto h-13 sm:h-14 px-3 sm:px-4 rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/85 dark:bg-(--app-surface-subtle)/90 backdrop-blur-md ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.06),0_6px_16px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_8px_20px_-4px_rgba(0,0,0,0.35)] flex items-center justify-between gap-3">
          <button
            type="button"
            :aria-label="`${siteName} — Return to homepage`"
            class="inline-flex items-center text-left min-w-0 cursor-pointer rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            @click="handleRedirect('/')"
          >
            <UiAppLogo
              :as-link="false"
              letter-mode="wave"
            />
          </button>

          <div class="flex items-center gap-2 shrink-0">
            <span
              class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs border border-(--app-border) bg-(--app-bg) font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 select-none"
            >
              <span
                class="size-1.5 rounded-full"
                :class="is404 ? 'bg-amber-500' : 'bg-error-500'"
                aria-hidden="true"
              />
              HTTP {{ statusCode }}
            </span>

            <UButton
              label="Home"
              icon="i-lucide-home"
              color="neutral"
              variant="subtle"
              size="sm"
              class="rounded-xs font-mono text-xs border border-(--app-border)"
              @click="handleRedirect('/')"
            />
          </div>
        </div>
      </header>

      <!-- Main Error Diagnostic Card -->
      <main class="flex-1 flex items-center justify-center py-12 sm:py-16 min-w-0">
        <UContainer class="flex flex-col items-center min-w-0">
          <section
            role="alert"
            aria-labelledby="error-page-title"
            class="w-full max-w-xl rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/75 dark:bg-(--app-surface-subtle)/85 backdrop-blur-xs ring-1 ring-inset ring-white/45 dark:ring-white/6 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06),0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_14px_-2px_rgba(0,0,0,0.45),0_12px_28px_-6px_rgba(0,0,0,0.4)] p-6 sm:p-10 text-center space-y-6 min-w-0"
          >
            <!-- Status Icon Badge -->
            <div class="flex justify-center">
              <div
                class="inline-flex items-center justify-center size-13 rounded-xs border"
                :class="
                  is404
                    ? 'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'border-error-500/25 bg-error-500/10 text-error-600 dark:text-error-400'
                "
              >
                <UIcon
                  :name="is404 ? 'i-lucide-file-question' : 'i-lucide-octagon-alert'"
                  class="size-6"
                  aria-hidden="true"
                />
              </div>
            </div>

            <!-- Telemetry Eyebrow & Status Code -->
            <div class="space-y-2 min-w-0">
              <p
                class="font-mono text-xs font-bold uppercase tracking-widest"
                :class="is404 ? 'text-primary-600 dark:text-primary-400' : 'text-error-600 dark:text-error-400'"
              >
                {{ statusCode }} // {{ statusLabel }}
              </p>

              <h1
                id="error-page-title"
                class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15] text-balance"
              >
                {{ errorTitle }}
              </h1>
            </div>

            <!-- Explanation & Requested Path -->
            <div class="space-y-3 min-w-0">
              <p class="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 leading-relaxed text-pretty">
                {{ errorDescription }}
              </p>

              <div v-if="requestedPath" class="pt-1 flex justify-center min-w-0">
                <code class="inline-block max-w-full px-2.5 py-1 rounded-xs border border-(--app-border) bg-(--app-bg) font-mono text-xs text-neutral-600 dark:text-neutral-400 [overflow-wrap:anywhere]">
                  {{ requestedPath }}
                </code>
              </div>
            </div>

            <!-- Recovery Actions -->
            <div class="pt-2 flex flex-wrap items-center justify-center gap-2.5">
              <UButton
                label="Return Home"
                icon="i-lucide-arrow-left"
                color="primary"
                variant="solid"
                size="md"
                class="rounded-xs font-mono text-xs uppercase tracking-wider px-5"
                @click="handleRedirect('/')"
              />

              <UButton
                label="Browse Articles"
                icon="i-lucide-library"
                color="neutral"
                variant="subtle"
                size="md"
                class="rounded-xs font-mono text-xs uppercase tracking-wider px-5 border border-(--app-border)"
                @click="handleRedirect('/blogs')"
              />

              <UButton
                v-if="!is404"
                label="Try Again"
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                size="md"
                class="rounded-xs font-mono text-xs uppercase tracking-wider px-4"
                @click="handleRetry"
              />
            </div>
          </section>

          <!-- Development Diagnostics Trace -->
          <section
            v-if="isDev && formattedTrace"
            aria-label="Development error trace"
            class="mt-8 w-full max-w-2xl rounded-xs border border-(--app-border) bg-(--app-surface-subtle)/60 overflow-hidden text-left min-w-0"
          >
            <div class="px-4 py-2.5 border-b border-(--app-border) flex items-center justify-between gap-2">
              <div class="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                <UIcon
                  name="i-lucide-terminal"
                  class="size-3.5 text-primary-500 shrink-0"
                  aria-hidden="true"
                />
                <span>Development Trace</span>
              </div>

              <UButton
                :label="copied ? 'Copied' : 'Copy'"
                :icon="copied ? 'i-lucide-check' : 'i-lucide-copy'"
                color="neutral"
                variant="ghost"
                size="xs"
                class="rounded-xs font-mono text-[11px]"
                @click="copyTrace"
              />
            </div>

            <pre class="p-4 max-w-full max-h-72 overflow-auto bg-(--app-bg) font-mono text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{{ formattedTrace }}</pre>
          </section>
        </UContainer>
      </main>

      <!-- Minimal Footer -->
      <footer class="py-5 px-4 sm:px-6 lg:px-8 border-t border-(--app-border)">
        <div class="max-w-(--ui-container) mx-auto flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
          <span>© {{ currentYear }} {{ siteName }}</span>
          <span>STATUS // {{ statusCode }}</span>
        </div>
      </footer>
    </div>
  </UApp>
</template>
