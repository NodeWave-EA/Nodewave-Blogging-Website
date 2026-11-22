import {
  breakpointsTailwind,
  useBreakpoints,
  useWindowScroll,
} from "@vueuse/core";

export function useFloatingHeader() {
  const { y } = useWindowScroll();
  const breakpoints = useBreakpoints(breakpointsTailwind);

  const isDesktop = breakpoints.greaterOrEqual("lg");

  const isFloating = computed(() => {
    if (!isDesktop.value)
      return false;

    return y.value > 24;
  });

  const headerClass = computed(() => [
    "sticky inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
    isFloating.value
      ? "px-4 sm:px-6 lg:px-8 pt-3 bg-transparent border-b-0 backdrop-blur-none"
      : "px-0 pt-0 bg-(--app-bg)/85 border-b border-(--app-border) backdrop-blur-md",
  ]);

  const containerClass = computed(() => [
    "mx-auto max-w-(--ui-container) h-full transition-all duration-300 ease-out",
    isFloating.value
      ? "rounded-xs border border-(--app-border) bg-(--app-bg)/90 backdrop-blur-xl shadow-sm px-4 sm:px-6"
      : "rounded-none border-transparent px-4 sm:px-6 lg:px-8",
  ]);

  return {
    isFloating,
    headerClass,
    containerClass,
  };
}
