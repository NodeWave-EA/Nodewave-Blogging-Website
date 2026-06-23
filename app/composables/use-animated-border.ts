export function useAnimatedBorder(targetElement: Ref<HTMLElement | null>) {
  const { x, y, sourceType } = useMouse();
  const isHovered = ref(false);

  const handlePointerEnter = () => {
    isHovered.value = true;
  };

  const handlePointerLeave = () => {
    isHovered.value = false;
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (!targetElement.value)
      return;

    const rect = targetElement.value.getBoundingClientRect();
    x.value = event.clientX - rect.left;
    y.value = event.clientY - rect.top;
  };

  onMounted(() => {
    if (targetElement.value) {
      targetElement.value.addEventListener("pointerenter", handlePointerEnter);
      targetElement.value.addEventListener("pointerleave", handlePointerLeave);
      targetElement.value.addEventListener("pointermove", handlePointerMove);
    }
  });

  onUnmounted(() => {
    if (targetElement.value) {
      targetElement.value.removeEventListener("pointerenter", handlePointerEnter);
      targetElement.value.removeEventListener("pointerleave", handlePointerLeave);
      targetElement.value.removeEventListener("pointermove", handlePointerMove);
    }
  });

  return { x, y, sourceType, isHovered };
}
