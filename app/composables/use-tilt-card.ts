type TiltOptions = {
  strengthX?: number;
  strengthY?: number;
  resetX?: number;
  resetY?: number;
  perspective?: number;
  scale?: number;
  speed?: number;
  easing?: string;
};
export function useTiltCard(options?: TiltOptions) {
  const {
    strengthX = 15,
    strengthY = 15,
    resetX = 0,
    resetY = 0,
    perspective = 1000,
    scale = 1.05,
    speed = 400,
    easing = "cubic-bezier(.03,.98,.52,.99)",
  } = options || {};

  const elementRef = ref<HTMLElement | null>(null);
  const rotateX = ref(resetX);
  const rotateY = ref(resetY);
  const isTracking = ref(false);

  const handlePointerMove = (event: PointerEvent) => {
    if (!elementRef.value)
      return;

    const rect = elementRef.value.getBoundingClientRect();
    const offsetX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const offsetY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);

    rotateX.value = offsetY * strengthX;
    rotateY.value = -offsetX * strengthY;
  };

  const handlePointerEnter = () => {
    isTracking.value = true;
  };

  const handlePointerLeave = () => {
    isTracking.value = false;
    rotateX.value = resetX;
    rotateY.value = resetY;
  };

  const transformStyles = computed(() => {
    return {
      transform: `perspective(${perspective}px) rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg) scale(${isTracking.value ? scale : 1})`,
      transition: isTracking.value ? `transform ${speed}ms ${easing}` : `transform ${speed}ms ${easing}`,
      willChange: isTracking.value ? "transform" : "auto",
    };
  });

  return {
    elementRef,
    handlePointerEnter,
    handlePointerLeave,
    handlePointerMove,
    transformStyles,
  };
}
