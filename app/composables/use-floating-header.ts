import {
  breakpointsTailwind,
  useBreakpoints,
  useWindowScroll,
} from "@vueuse/core";

export function useFloatingHeader() {
  const { y } = useWindowScroll();

  const breakpoints = useBreakpoints(breakpointsTailwind);

  const isDesktop = breakpoints.greaterOrEqual("md");

  const isFloating = computed(() => {
    if (!isDesktop.value)
      return false;

    return y.value > 24;
  });

  const headerClass = computed(() => [
    "sticky inset-x-0 top-0 z-50",
    "transition-all duration-300 ease-out",
    isFloating.value ? "px-2 pt-4" : "px-0 pt-0",
  ]);

  const containerClass = computed(() => [
    "mx-auto max-w-(--ui-container)",
    "transition-all duration-300 ease-out",

    isFloating.value
      ? [
          "rounded-2xl",
          "border border-default/50",
          "backdrop-blur-xl",
          "shadow-xl",
        ].join(" ")
      : ["rounded-none", "border-transparent"].join(" "),
  ]);

  return {
    isFloating,
    headerClass,
    containerClass,
  };
}
