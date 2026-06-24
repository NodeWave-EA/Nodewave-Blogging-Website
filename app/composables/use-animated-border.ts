import { onMounted, onUnmounted, ref } from "vue";

import type { Ref } from "vue";

export function useAnimatedBorder(targetRef: Ref<HTMLElement | null>) {
  const mouseX = ref(0);
  const mouseY = ref(0);
  const isHovered = ref(false);

  const handlePointerMove = (event: PointerEvent) => {
    if (!targetRef.value)
      return;

    const rect = targetRef.value.getBoundingClientRect();
    // Calculate precise local coordinates inside the element bounds
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
    if (targetRef.value) {
      targetRef.value.addEventListener("pointermove", handlePointerMove);
      targetRef.value.addEventListener("pointerenter", handlePointerEnter);
      targetRef.value.addEventListener("pointerleave", handlePointerLeave);
    }
  });

  onUnmounted(() => {
    if (targetRef.value) {
      targetRef.value.removeEventListener("pointermove", handlePointerMove);
      targetRef.value.removeEventListener("pointerenter", handlePointerEnter);
      targetRef.value.removeEventListener("pointerleave", handlePointerLeave);
    }
  });

  return {
    mouseX,
    mouseY,
    isHovered,
  };
}
