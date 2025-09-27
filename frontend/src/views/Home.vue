<template>
  <div class="home-page min-h-screen">
    <!-- Hero Section -->
    <!-- <HeroSection /> -->

    <!-- Featured Posts -->
    <FeaturedPosts />

    <!-- Latest Posts -->
    <!-- <LatestPosts /> -->

    <!-- Testimonials Section -->
    <!-- <TestimonialsSection /> -->

    <!-- Newsletter Signup -->
    <!-- <NewsletterSignup /> -->
  </div>
</template>

<script setup lang="ts">
  import FeaturedPosts from '@/components/blog/FeaturedPosts.vue';
  import HeroSection from '@/components/sections/HeroSection.vue';
  import LatestPosts from '@/components/blog/LatestPosts.vue';
  import NewsletterSignup from '@/components/sections/NewsletterSignup.vue';
  import TestimonialsSection from '@/components/sections/TestimonialsSection.vue';
  import { updateSEO } from '@/utils/seo';
  import { onMounted } from 'vue';

  onMounted(() => {
    updateSEO({
      title: 'Nodewave Blog – Insights, Stories & Innovation',
      description:
        'Nodewave Blog: Discover the latest insights, news, and stories from our team. Explore tech trends, tutorials, company culture, and more.',
      type: 'website',
    })
  })
</script>
