import { onMounted, onUnmounted, ref } from "vue";

export function useReadingProgress() {
  const scrollProgress = ref(0);

  function trackReadingProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      scrollProgress.value = (window.scrollY / totalHeight) * 100;
    }
  }

  onMounted(() => window.addEventListener("scroll", trackReadingProgress));
  onUnmounted(() => window.removeEventListener("scroll", trackReadingProgress));

  return {
    scrollProgress,
  };
}
