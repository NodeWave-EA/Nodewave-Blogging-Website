import { nextTick, onActivated, onMounted, ref, watch } from "vue";

export function useAOS() {
  const { $refreshAos, $refreshHardAos } = useNuxtApp();
  const route = useRoute();
  const initialized = ref(false);

  const safeRefresh = async (refreshFn: any) => {
    await nextTick();
    if (typeof refreshFn === "function") {
      refreshFn();
    }
  };

  onMounted(() => {
    safeRefresh($refreshAos);
    initialized.value = true;
  });

  onActivated(() => {
    safeRefresh($refreshHardAos);
  });

  watch(
    () => route.fullPath,
    () => {
      // Only refresh if we've already mounted and navigated to a subsequent route
      if (initialized.value) {
        safeRefresh($refreshAos);
      }
    },
  );
}
