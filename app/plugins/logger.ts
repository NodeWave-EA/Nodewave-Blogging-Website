export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const level = config.public.logLevel as any;

  if (level === "disable") {
    Logger.overrideLogger(false);
  }
  else {
    Logger.setLogLevel(level);
  }
});
