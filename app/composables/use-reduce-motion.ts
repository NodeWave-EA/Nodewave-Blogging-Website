import { useMounted, usePreferredReducedMotion } from "@vueuse/core";
import { computed } from "vue";

const logger = new Logger("useReduceMotion Composable");

export function useReduceMotion() {
  const isMounted = useMounted();
  const motionPreference = usePreferredReducedMotion();

  logger.log("User's motion preference:", { motionPreference: motionPreference.value });

  const isMotionReduced = computed<boolean>(() => {
    if (!isMounted.value)
      return true;
    return motionPreference.value === "reduce";
  });

  return { isMotionReduced };
}
