<template>
  <div>
    <!-- Hero Section -->
    <HeroSection />

    <!-- Featured Posts -->
    <FeaturedPosts />

    <!-- Latest Posts -->
    <LatestPosts />

    <!-- Newsletter Signup -->
    <NewsletterSignup />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import HeroSection from '@/components/sections/HeroSection.vue'
import FeaturedPosts from '@/components/sections/FeaturedPosts.vue'
import LatestPosts from '@/components/sections/LatestPosts.vue'
import NewsletterSignup from '@/components/sections/NewsletterSignup.vue'
import { updateSEO } from '@/utils/seo'

onMounted(() => {
  updateSEO({
    title: 'Home',
    description:
      'Welcome to our company blog. Discover the latest insights, news, and stories from our team.',
    type: 'website',
  })
})
</script>
