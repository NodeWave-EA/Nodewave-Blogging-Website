import { onMounted, onUnmounted, ref } from "vue";

import type { Ref } from "vue";

export function useAnimatedBorder(targetRef: Ref<any>) {
  const mouseX = ref(0);
  const mouseY = ref(0);
  const isHovered = ref(false);

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
    const el = getTargetElement(targetRef.value);
    if (!el)
      return;

    const rect = el.getBoundingClientRect();
    mouseX.value = event.clientX - rect.left;
    mouseY.value = event.clientY - rect.top;
  };

  const handlePointerEnter = () => {
    isHovered.value = true;
  };

  const handlePointerLeave = () => {
    isHovered.value = false;
  };

  onMounted(() => {
    const el = getTargetElement(targetRef.value);
    if (el && typeof el.addEventListener === "function") {
      el.addEventListener("pointermove", handlePointerMove);
      el.addEventListener("pointerenter", handlePointerEnter);
      el.addEventListener("pointerleave", handlePointerLeave);
    }
  });

  onUnmounted(() => {
    const el = getTargetElement(targetRef.value);
    if (el && typeof el.removeEventListener === "function") {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerenter", handlePointerEnter);
      el.removeEventListener("pointerleave", handlePointerLeave);
    }
  });

  return {
    mouseX,
    mouseY,
    isHovered,
  };
}
