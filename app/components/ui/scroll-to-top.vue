<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const isVisible = ref(false);

function checkScrollVisibility() {
  isVisible.value = window.scrollY > 400;
}

function scrollToTopNode() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onMounted(() => {
  window.addEventListener("scroll", checkScrollVisibility);
});

onUnmounted(() => {
  window.removeEventListener("scroll", checkScrollVisibility);
});
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-8 opacity-0 scale-95"
    enter-to-class="transform translate-y-0 opacity-100 scale-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-8 opacity-0 scale-95"
  >
    <UButton
      v-if="isVisible"
      icon="i-lucide-arrow-up"
      color="primary"
      size="md"
      class="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border border-primary-400/20"
      aria-label="Scroll to top of log stream"
      @click="scrollToTopNode"
    />
  </Transition>
</template>
