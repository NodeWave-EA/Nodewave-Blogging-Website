import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";

import { useReduceMotion } from "~/composables/use-reduce-motion";

const logger = new Logger("useTheme Composable");
export function useTheme() {
  const { $refreshHardAos } = useNuxtApp();
  const { isMotionReduced } = useReduceMotion();

  const colorMode = useColorMode();

  logger.debug("Initial color mode preference:", { preference: colorMode.preference });

  onMounted(() => {
    watch(
      [() => colorMode.preference, () => colorMode.value],
      ([preference, resolved]) => {
        logger.log("Current color mode preference:", { preference, resolved });
      },
      { immediate: true },
    );
  });

  const lastMousePos = ref({ x: 0, y: 0 });

  type ThemeEvent = MouseEvent | TouchEvent | KeyboardEvent;

  const newTheme = computed(() =>
    colorMode.preference === "dark" ? "light" : "dark",
  );

  const currentIcon = computed(() =>
    colorMode.preference === "dark"
      ? "i-line-md-sunny-filled-loop"
      : "i-line-md-moon-filled-loop",
  );

  const toggleTheme = () => {
    colorMode.preference = newTheme.value;
    logger.debug("Theme preference updated to:", { preference: colorMode.preference });
  };

  const refreshAos = () => {
    nextTick(() => {
      if (typeof $refreshHardAos === "function") {
        $refreshHardAos();
      }
    });
  };

  const updatePointer = (e: MouseEvent) => {
    lastMousePos.value = { x: e.clientX, y: e.clientY };
  };

  onMounted(() => {
    lastMousePos.value = {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
    };

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", updatePointer, { passive: true });
    }
  });

  onUnmounted(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("mousemove", updatePointer);
    }
  });

  const startViewTransition = async (event?: ThemeEvent) => {
    // Safety check for SSR environment and browser support
    if (typeof document === "undefined" || !document.startViewTransition || isMotionReduced.value) {
      toggleTheme();
      refreshAos();
      return;
    }

    const x
      = event instanceof MouseEvent
        ? event.clientX
        : event instanceof TouchEvent
          ? (event.touches?.[0]?.clientX ?? lastMousePos.value.x)
          : lastMousePos.value.x;

    const y
      = event instanceof MouseEvent
        ? event.clientY
        : event instanceof TouchEvent
          ? (event.touches?.[0]?.clientY ?? lastMousePos.value.y)
          : lastMousePos.value.y;

    const viewWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
    const viewHeight = typeof window !== "undefined" ? window.innerHeight : 1080;

    const endRadius = Math.hypot(
      Math.max(x, viewWidth - x),
      Math.max(y, viewHeight - y),
    );

    const changingToDark = newTheme.value === "dark";

    // Dynamic Style Injection to prepare the browser for blending
    const style = document.createElement("style");
    style.innerHTML = `
      ::view-transition-old(root),
      ::view-transition-new(root) {
        animation: none !important;
        mix-blend-mode: normal !important;
      }
      ::view-transition-old(root) {
        z-index: ${changingToDark ? 1 : 2};
      }
      ::view-transition-new(root) {
        z-index: ${changingToDark ? 2 : 1};
      }
    `;
    document.head.appendChild(style);

    // Add active transitioning flag to HTML block
    document.documentElement.setAttribute("data-view-transitioning", "true");

    try {
      const transition = document.startViewTransition(async () => {
        toggleTheme();
        await nextTick();
      });

      await transition.ready;

      const duration = 650;
      const clipPathFrames = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      // Always animate the incoming layer (New view expands on top of old view)
      document.documentElement.animate(
        {
          clipPath: changingToDark ? clipPathFrames : [...clipPathFrames].reverse(),
        },
        {
          duration,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "both",
          pseudoElement: changingToDark ? "::view-transition-new(root)" : "::view-transition-old(root)",
        },
      );

      await transition.finished;
    }
    catch (err) {
      logger.error("View transition failed:", err);
      toggleTheme();
    }
    finally {
      // Clean up DOM attributes and styles
      document.documentElement.removeAttribute("data-view-transitioning");
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
      refreshAos();
    }
  };

  return {
    newTheme,
    currentIcon,
    toggleTheme,
    startViewTransition,
  };
}
