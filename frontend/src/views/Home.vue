<template>
  <div class="home-page min-h-screen">
    <!-- Page Header -->
    <PageHeader tag="Welcome" title="Nodewave Blog"
      description="Discover the latest insights, news, and stories from our team. Explore tech trends, tutorials, company culture, and more."
      size="regular" />

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
  import PageHeader from '@/components/ui/PageHeader.vue';
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
