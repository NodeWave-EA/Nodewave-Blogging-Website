import { onUnmounted, ref } from "vue";

export type MatrixDecryptOptions = {
  /** The duration multiplier for the decryption speed. Lower is faster. Defaults to 25. */
  speed?: number;
  /** The number of characters decoded per frame. Defaults to 0.34. */
  revealStep?: number;
};

export function useMatrixDecrypt(options: MatrixDecryptOptions = {}) {
  const speed = options.speed ?? 25;
  const revealStep = options.revealStep ?? 0.34;

  const { isMotionReduced } = useReduceMotion();

  const matrixChars = "01ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ".split("");

  // Reactive storage dictionary for actively animating elements
  const activeHoverText = ref<Record<string, string>>({});

  // Track continuous animation frame ID handlers to avoid thread overlap
  const activeFrames: Record<string, number> = {};

  const startDecryption = (label: string, id: string): void => {
    if (isMotionReduced.value)
      return;

    // Cancel any existing animation frame loop assigned to this specific ID instance
    if (activeFrames[id]) {
      cancelAnimationFrame(activeFrames[id]);
    }

    let iterations = 0;
    let lastTimestamp = 0;
    const originalText = label;

    const tick = (timestamp: number) => {
      if (!lastTimestamp)
        lastTimestamp = timestamp;
      const elapsed = timestamp - lastTimestamp;

      // Throttle the rendering loop to match your preferred speed configuration threshold
      if (elapsed >= speed) {
        lastTimestamp = timestamp;

        activeHoverText.value[id] = originalText
          .split("")
          .map((char, index) => {
            if (char === " ")
              return " ";
            if (index < iterations)
              return originalText[index];
            return matrixChars[Math.floor(Math.random() * matrixChars.length)] ?? "";
          })
          .join("");

        // Frame execution boundary completion check
        if (iterations >= originalText.length) {
          delete activeFrames[id];
          delete activeHoverText.value[id];
          return;
        }

        iterations += revealStep;
      }

      // Queue up next frame sequence cleanly
      activeFrames[id] = requestAnimationFrame(tick);
    };

    activeFrames[id] = requestAnimationFrame(tick);
  };

  const clearDecryption = (id: string): void => {
    if (activeFrames[id]) {
      cancelAnimationFrame(activeFrames[id]);
      delete activeFrames[id];
    }
    // in-place deletion
    delete activeHoverText.value[id];
  };

  // Automated layout destruction cleanup handler
  onUnmounted(() => {
    Object.values(activeFrames).forEach(cancelAnimationFrame);
    activeHoverText.value = {};
  });

  return {
    activeHoverText,
    startDecryption,
    clearDecryption,
  };
}
