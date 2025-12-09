<template>
  <div class="home-page min-h-screen">
    <HomeSkeleton v-if="pageLoading" />

    <template v-else>
      <!-- Page Header -->
      <PageHeader
        tag="Welcome"
        title="Nodewave Blog"
        description="Discover the latest insights, news, and stories from our team. Explore tech trends, tutorials, company culture, and more."
        size="regular"
      />

      <!-- Featured Posts -->
      <FeaturedPosts @loaded="onFeaturedLoaded" />

      <!-- Latest Posts -->
      <!-- <LatestPosts /> -->

      <!-- Testimonials Section -->
      <!-- <TestimonialsSection /> -->

      <!-- Newsletter Signup -->
      <!-- <NewsletterSignup /> -->
    </template>
  </div>
</template>

<script setup lang="ts">
import FeaturedPosts from '@/components/blog/FeaturedPosts.vue'
import HomeSkeleton from '@/components/ui/HomeSkeleton.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { updateSEO } from '@/utils/seo'
import { onMounted, ref } from 'vue'

const pageLoading = ref(true)

const onFeaturedLoaded = () => {
  pageLoading.value = false
}

onMounted(() => {
  updateSEO({
    title: 'Nodewave Blog – Insights, Stories & Innovation',
    description:
      'Nodewave Blog: Discover the latest insights, news, and stories from our team. Explore tech trends, tutorials, company culture, and more.',
    type: 'website',
  })
  // Safety timeout in case the child emits fail to fire
  setTimeout(() => {
    pageLoading.value = false
  }, 8000)
})
</script>
