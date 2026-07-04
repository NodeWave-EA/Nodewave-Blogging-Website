<script setup>
const props = defineProps({
  title: { type: String, required: true },
});

const route = useRoute();
const runtimeConfig = useRuntimeConfig();

// Get absolute current URL
const siteUrl = runtimeConfig.public.siteUrl || "https://yourwebsite.com";
const currentUrl = `${siteUrl}${route.path}`;
const encodedUrl = encodeURIComponent(currentUrl);
const encodedTitle = encodeURIComponent(props.title);

// Share Links
const shareLinks = {
  x: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
  whatsapp: `https://whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
  facebook: `https://facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  linkedin: `https://linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
};

// Copy URL State
const isCopied = ref(false);

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(currentUrl);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 2000); // Reset after 2 seconds
  }
  catch (err) {
    console.error("Failed to copy: ", err);
  }
}
</script>

<template>
  <UPopover modal arrow>
    <UButton
      leading-icon="i-lucide-share"
      label="Share Blog"
      variant="outline"
      size="sm"
      color="neutral"
      :ui="{
        base: 'cursor-pointer',
        leadingIcon: 'text-primary',
      }"
    />

    <template #content>
      <div class="flex flex-col gap-2 p-4">
        <UPageAnchors
          :links="[
            {
              label: 'X (Twitter)',
              href: shareLinks.x,
              icon: 'i-codicon-twitter',
              target: '_blank',
            },
            {
              label: 'WhatsApp',
              href: shareLinks.whatsapp,
              icon: 'i-simple-icons-whatsapp',
              target: '_blank',
            },
            {
              label: 'Facebook',
              href: shareLinks.facebook,
              icon: 'i-lucide-facebook',
              target: '_blank',
            },
            {
              label: 'LinkedIn',
              href: shareLinks.linkedin,
              icon: 'i-lucide-linkedin',
              target: '_blank',
            },
          ]"
        />

        <UButton
          variant="outline"
          size="sm"
          color="neutral"
          :ui="{
            base: 'cursor-pointer',
            leadingIcon: 'text-primary',
          }"
          :leading-icon="isCopied ? 'i-lucide-copy-check' : 'i-lucide-copy'"
          :label="isCopied ? 'Copied!' : 'Copy URL'"
          @click="copyToClipboard"
        />
      </div>
    </template>
  </UPopover>
</template>
