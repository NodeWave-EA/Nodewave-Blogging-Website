export function useAnimateCounter(target: number) {
  const current = ref(0);
  const isAnimating = ref(false);

  const animate = () => {
    if (!isAnimating.value) {
      isAnimating.value = true;
      const duration = 1000; // Animation duration in milliseconds
      const startTime = performance.now();

      const update = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        current.value = Math.floor(progress * target);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
        else {
          isAnimating.value = false;
        }
      };

      requestAnimationFrame(update);
    }
  };

  return { current, isAnimating, animate };
}
