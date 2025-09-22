<template>
  <section class="relative overflow-hidden py-10 sm:py-12 lg:py-16">
    <!-- Content Container -->
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center">

        <!-- About Section -->
        <AboutSection />

        <!-- Call to Action Section -->
        <CallToActionSection />

        <StatsSection />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import AboutSection from '@/components/sections/AboutSection.vue';
  import CallToActionSection from '@/components/sections/CallToActionSection.vue';
  import StatsSection from '@/components/sections/StatsSection.vue';
</script>
