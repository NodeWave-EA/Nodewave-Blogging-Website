import { useWindowScroll, useWindowSize } from "@vueuse/core";
import { computed } from "vue";

export function useSmoothScroll(behavior: "smooth" | "auto" = "smooth", offset: number = 80) {
  const { y: scrollY } = useWindowScroll();
  const { height: windowHeight } = useWindowSize();

  const scrollToId = (elementId: string) => {
    if (typeof document === "undefined")
      return;
    const element = document.getElementById(elementId);

    if (element) {
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior,
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior });
  };

  const isScrolled = computed(() => scrollY.value > 50);

  const scrollPercentage = computed(() => {
    if (typeof document === "undefined")
      return 0;
    const scrollHeight = document.documentElement.scrollHeight - windowHeight.value;
    return scrollHeight > 0 ? Math.min(100, (scrollY.value / scrollHeight) * 100) : 0;
  });

  return {
    scrollToId,
    scrollToTop,
    isScrolled,
    scrollPercentage,
    scrollY,
  };
}
