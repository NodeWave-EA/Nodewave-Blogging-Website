import { computed, ref } from "vue";

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

  const elementRef = ref<any>(null);
  const rotateX = ref(resetX);
  const rotateY = ref(resetY);
  const isTracking = ref(false);

  const getTargetElement = (target: any): HTMLElement | null => {
    if (!target)
      return null;
    if (target instanceof HTMLElement)
      return target;
    if (target.$el instanceof HTMLElement)
      return target.$el;
    return null;
  };

  const handlePointerMove = (event: PointerEvent) => {
    const el = getTargetElement(elementRef.value);
    if (!el)
      return;

    const rect = el.getBoundingClientRect();
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
      transition: `transform ${speed}ms ${easing}`,
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
