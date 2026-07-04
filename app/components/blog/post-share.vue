<script setup lang="ts">
import { useRoute, useRuntimeConfig } from "#imports";
import { computed, ref } from "vue";

const props = defineProps({
  title: { type: String, required: true },
});

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

const currentUrl = computed(() => {
  const siteUrl = runtimeConfig.public.siteUrl || "https://yourwebsite.com";
  // Strip trailing slash from siteUrl to prevent double slashes
  const baseUrl = siteUrl.replace(/\/$/, "");
  return `${baseUrl}${route.path}`;
});

// Generate share links
const shareLinks = computed(() => {
  const encodedUrl = encodeURIComponent(currentUrl.value);
  const encodedTitle = encodeURIComponent(props.title);

  return [
    {
      label: "X (Twitter)",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      icon: "i-simple-icons-x",
    },
    {
      label: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      icon: "i-simple-icons-whatsapp",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: "i-simple-icons-facebook",
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      icon: "i-simple-icons-linkedin",
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      icon: "i-simple-icons-telegram",
    },
    {
      label: "Reddit",
      href: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      icon: "i-simple-icons-reddit",
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      icon: "i-lucide-mail",
    },
    {
      label: "BlueSky",
      href: `https://bsky.app/intent/compose?text=${encodedTitle}%20${encodedUrl}`,
      icon: "i-simple-icons-bluesky",
    },
  ];
});

const isCopied = ref(false);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentUrl.value);
    isCopied.value = true;
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  }
  catch (err) {
    console.error("Failed to copy URL: ", err);
  }
}
</script>

<template>
  <UPopover
    arrow
    modal
  >
    <UButton
      icon="i-lucide-share-2"
      label="Share"
      variant="soft"
      color="neutral"
      size="sm"
      class="font-medium rounded-lg transition-colors hover:text-primary-500 dark:hover:text-primary-400"
    />

    <template #content>
      <div class="p-2 w-56 flex flex-col gap-1">
        <!-- Header -->
        <div class="px-3 pt-2 pb-1.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Share this post
          </h3>
        </div>

        <!-- Social Links -->
        <UButton
          v-for="link in shareLinks"
          :key="link.label"
          :to="link.href"
          target="_blank"
          rel="noopener noreferrer"
          variant="ghost"
          color="neutral"
          size="sm"
          trailing-icon="i-lucide-external-link"
          class="w-full justify-start font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          :icon="link.icon"
          :ui="{
            trailingIcon: 'absolute right-3 text-neutral-500 dark:text-neutral-400',
          }"
        >
          {{ link.label }}
        </UButton>

        <USeparator class="my-1 border-neutral-200 dark:border-neutral-800" />

        <!-- Copy URL Button -->
        <UButton
          variant="ghost"
          size="sm"
          class="w-full justify-start font-medium transition-all duration-200"
          :color="isCopied ? 'success' : 'neutral'"
          :icon="isCopied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          @click="copyToClipboard"
        >
          {{ isCopied ? 'Link Copied!' : 'Copy Link' }}
        </UButton>
      </div>
    </template>
  </UPopover>
</template>
