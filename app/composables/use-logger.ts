type Options = {
  context: string;
};

export function useLogger(options: Options) {
  const { context } = options;

  const logger = new Logger(context);

  return {
    logger,
  };
}
