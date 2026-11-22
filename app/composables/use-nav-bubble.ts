import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

import type { useRoute } from "#app";
import type { ComponentPublicInstance } from "vue";
import type { Link } from "~/types";

type RouteLocation = ReturnType<typeof useRoute>;

export function isNavLinkActive(linkTo: string, currentPath: string): boolean {
  if (!linkTo)
    return false;
  if (linkTo === "/")
    return currentPath === "/";
  return currentPath === linkTo || currentPath.startsWith(`${linkTo}/`);
}

export function useNavBubble(
  route: RouteLocation,
  navLinks: Link[],
) {
  const linkRefs = ref<(HTMLElement | null)[]>([]);

  const bubbleStyles = ref({
    transform: "translateX(0px)",
    width: "0px",
    opacity: "0",
  });

  const setLinkRef = (
    el: Element | ComponentPublicInstance | null,
    index: number,
  ): void => {
    if (!el) {
      linkRefs.value[index] = null;
      return;
    }

    if ("$el" in el) {
      linkRefs.value[index] = el.$el as HTMLElement;
    }
    else {
      linkRefs.value[index] = el as HTMLElement;
    }
  };

  const updateBubblePosition = async (): Promise<void> => {
    await nextTick();
    const currentPath = route.path;
    const activeIndex = navLinks.findIndex(link => isNavLinkActive(link.to, currentPath));

    if (activeIndex === -1) {
      bubbleStyles.value.opacity = "0";
      return;
    }

    const activeEl = linkRefs.value[activeIndex];
    if (!activeEl) {
      bubbleStyles.value.opacity = "0";
      return;
    }

    bubbleStyles.value = {
      transform: `translateX(${activeEl.offsetLeft}px)`,
      width: `${activeEl.offsetWidth}px)`,
      opacity: "1",
    };
  };

  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    void updateBubblePosition();
    if (typeof window !== "undefined" && "ResizeObserver" in window) {
      resizeObserver = new ResizeObserver(() => {
        void updateBubblePosition();
      });

      linkRefs.value.forEach((el) => {
        if (el)
          resizeObserver?.observe(el);
      });
    }
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
  });

  watch(
    () => route.path,
    () => {
      void updateBubblePosition();
    },
  );

  return {
    setLinkRef,
    bubbleStyles,
    updateBubblePosition,
  };
}
