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
    :ui="{
      content: 'rounded-xs border border-[#e8e3d8] dark:border-[#26231f] bg-[#faf7f2] dark:bg-[#141311] shadow-2xs overflow-hidden',
      arrow: 'before:border-[#e8e3d8] dark:before:border-[#26231f] before:bg-[#faf7f2] dark:before:bg-[#141311]',
    }"
  >
    <UButton
      icon="i-lucide-share-2"
      label="Share"
      variant="subtle"
      color="neutral"
      size="xs"
      class="font-mono text-xs rounded-xs bg-[#f2eee5] dark:bg-[#1c1a17] border border-[#e0dad0]/80 dark:border-[#2a2722] hover:border-primary-500/50 hover:text-primary-500 transition-colors cursor-pointer"
    />

    <template #content>
      <div class="p-1.5 w-56 flex flex-col gap-0.5 select-none">
        <!-- Header -->
        <div class="px-2.5 pt-2 pb-1.5 border-b border-[#e8e3d8] dark:border-[#26231f] mb-1">
          <h3 class="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
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
          size="xs"
          trailing-icon="i-lucide-external-link"
          class="w-full justify-start font-mono text-xs text-neutral-700 dark:text-neutral-300 hover:bg-[#f3eee4] dark:hover:bg-[#1a1816] hover:text-primary-500 dark:hover:text-primary-400 rounded-xs transition-colors"
          :icon="link.icon"
          :ui="{
            trailingIcon: 'absolute right-2.5 text-neutral-400 dark:text-neutral-500 group-hover:text-primary-500 size-3',
          }"
        >
          {{ link.label }}
        </UButton>

        <USeparator class="my-1 border-[#e8e3d8] dark:border-[#26231f]" />

        <!-- Copy URL Button -->
        <UButton
          variant="ghost"
          size="xs"
          class="w-full justify-start font-mono text-xs rounded-xs transition-all duration-200 hover:bg-[#f3eee4] dark:hover:bg-[#1a1816]"
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
