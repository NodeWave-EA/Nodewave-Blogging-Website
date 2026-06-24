/* eslint-disable no-console */

/**
 * A Logger utility.
 * @example
 * ```ts
 * import { Logger } from './logger';
 *
 * const logger = new Logger('MyContext');
 * logger.log('Hello, world!');
 * ```
 */

// Log levels in increasing order of severity
const LOG_LEVELS = ["verbose", "debug", "log", "warn", "error", "fatal"] as const;

// Type for log levels, derived from the LOG_LEVELS array
type LogLevel = (typeof LOG_LEVELS)[number];

// Type definition for the LoggerService interface
type LoggerService = {
  log: (message: any, ...optionalParams: any[]) => any;
  error: (message: any, ...optionalParams: any[]) => any;
  warn: (message: any, ...optionalParams: any[]) => any;
  debug?: (message: any, ...optionalParams: any[]) => any;
  verbose?: (message: any, ...optionalParams: any[]) => any;
  fatal?: (message: any, ...optionalParams: any[]) => any;
  setLogLevel?: (levels: LogLevel[]) => any;
};

// Internal type for buffering log calls when a logger is not yet attached
type LogBufferRecord = {
  methodRef: (...args: unknown[]) => unknown;
  arguments: unknown[];
};

// Predefined themes for different log levels
// const THEMES: Record<LogLevel, string> = {
//   verbose: "color: #8b5cf6; font-weight: bold;", // Purple
//   debug: "color: #3b82f6; font-weight: bold;", // Blue
//   log: "color: #10b981; font-weight: bold;", // Emerald Green
//   warn: "color: #f59e0b; font-weight: bold;", // Amber
//   error: "color: #ef4444; font-weight: bold;", // Red
//   fatal: "color: #ffffff; background: #b91c1c; padding: 2px 4px; border-radius: 3px; font-weight: bold;",
// };

const ANSI_RESET = "\x1B[0m";

const THEMES: Record<LogLevel, string> = {
  verbose: "\x1B[35m", // Magenta
  debug: "\x1B[34m", // Blue
  log: "\x1B[32m", // Green
  warn: "\x1B[33m", // Yellow
  error: "\x1B[31m", // Red
  fatal: "\x1B[41m\x1B[37m", // White text on Red background
};

/**
 * Prints a log message with a smart pretty print format.
 * @param level - The log level (e.g., "log", "warn", "error").
 * @param context - Optional context to include in the log output.
 * @param showTimestamp - Whether to include a timestamp in the log output.
 * @param message - The main message to log.
 * @param optionalParams - Additional parameters to log, which can be of any type.
 */
// function smartPrettyPrint(level: LogLevel, context: string | undefined, showTimestamp: boolean, message: any, ...optionalParams: any[]) {
//   const timestamp = showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : "";
//   const contextStr = context ? `[${context}] ` : "";
//   const prefixCss = THEMES[level];

//   console.log(
//     `%c${timestamp} DEV ${contextStr}[${level.toUpperCase()}]:`,
//     prefixCss,
//     typeof message === "string" ? message : "",
//   );

//   const payload = typeof message === "string" ? optionalParams : [message, ...optionalParams];

//   payload.forEach((item) => {
//     if (item === undefined || item === null)
//       return;

//     if (Array.isArray(item) && item.length > 0 && typeof item[0] === "object") {
//       console.table(item);
//       return;
//     }

//     if (typeof item === "object") {
//       console.dir(item);
//       return;
//     }

//     console.log("   └─>", item);
//   });
// }

// Default logger implementation that uses the smart pretty print function

function smartPrettyPrint(level: LogLevel, context: string | undefined, showTimestamp: boolean, message: any, ...optionalParams: any[]) {
  const timestamp = showTimestamp ? `[${new Date().toLocaleTimeString()}] ` : "";
  const contextStr = context ? `[${context}] ` : "";
  const color = THEMES[level];

  // We construct the string with ANSI codes
  const output = `${color}${timestamp} DEV ${contextStr}[${level.toUpperCase()}]:${ANSI_RESET} ${typeof message === "string" ? message : ""}`;

  console.log(output);

  const payload = typeof message === "string" ? optionalParams : [message, ...optionalParams];

  payload.forEach((item) => {
    if (item === undefined || item === null)
      return;

    // console.table and console.dir do not support color coding in the same way
    if (Array.isArray(item) && item.length > 0 && typeof item[0] === "object") {
      console.table(item);
      return;
    }
    if (typeof item === "object") {
      console.dir(item, { colors: true }); // Enable colors for objects
      return;
    }
    console.log("   └─>", item);
  });
}

// Default logger implementation that uses the smart pretty print function
const DefaultPrettyPrinter: LoggerService = {
  log: (msg, ...params) => smartPrettyPrint("log", undefined, true, msg, ...params),
  warn: (msg, ...params) => smartPrettyPrint("warn", undefined, true, msg, ...params),
  error: (msg, ...params) => smartPrettyPrint("error", undefined, true, msg, ...params),
  debug: (msg, ...params) => smartPrettyPrint("debug", undefined, true, msg, ...params),
  verbose: (msg, ...params) => smartPrettyPrint("verbose", undefined, true, msg, ...params),
  fatal: (msg, ...params) => smartPrettyPrint("fatal", undefined, true, msg, ...params),
};

// Main Logger class that implements the LoggerService interface
export class Logger implements LoggerService {
  protected context?: string;
  protected options: { timestamp?: boolean } = { timestamp: true };
  protected static logBuffer: LogBufferRecord[] = [];
  protected static staticInstanceRef?: LoggerService = DefaultPrettyPrinter;
  protected static logLevels?: LogLevel[] = [...LOG_LEVELS];
  private static isBufferAttached = false;
  protected localInstanceRef?: LoggerService;

  // Constructor to initialize the logger with an optional context and options
  constructor(context?: string, options?: { timestamp?: boolean }) {
    this.context = context;
    if (options)
      this.options = { ...this.options, ...options };
    this.registerLocalInstanceRef();
  }

  static setLogLevel(minLevel: string) {
    // Check if it's a valid level name
    const idx = LOG_LEVELS.indexOf(minLevel as LogLevel);

    if (idx !== -1) {
      // Only set valid levels
      Logger.logLevels = [...LOG_LEVELS.slice(idx)];
    }
    else if (minLevel !== "disable") {
      // Default to 'log' if the input is garbage
      Logger.logLevels = [...LOG_LEVELS.slice(2)];
    }
  }

  // Getter for the local logger instance, which falls back to the static instance or default pretty printer if not set
  get localInstance(): LoggerService {
    if (this.localInstanceRef)
      return this.localInstanceRef;
    return Logger.staticInstanceRef || DefaultPrettyPrinter;
  }

  error(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("error", message, ...optionalParams);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("log", message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("warn", message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("debug", message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("verbose", message, ...optionalParams);
  }

  fatal(message: any, ...optionalParams: any[]): void {
    this.callUnderlying("fatal", message, ...optionalParams);
  }

  // Static Methods
  static error(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("error", message, ...optionalParams);
  }

  static log(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("log", message, ...optionalParams);
  }

  static warn(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("warn", message, ...optionalParams);
  }

  static debug(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("debug", message, ...optionalParams);
  }

  static verbose(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("verbose", message, ...optionalParams);
  }

  static fatal(message: any, ...optionalParams: any[]): void {
    this.callStaticUnderlying("fatal", message, ...optionalParams);
  }

  // Internal method to handle the actual logging logic, including buffering and pretty printing
  private callUnderlying(level: LogLevel, message: any, ...optionalParams: any[]) {
    if (!Logger.isLevelEnabled(level))
      return;

    let activeContext = this.context;
    if (optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === "string") {
      activeContext = optionalParams.pop();
    }

    if (Logger.isBufferAttached) {
      Logger.logBuffer.push({
        methodRef: () => smartPrettyPrint(level, activeContext, this.options.timestamp !== false, message, ...optionalParams),
        arguments: [],
      });
      return;
    }

    const runner = this.localInstance[level] || this.localInstance.log;
    if (this.localInstance === DefaultPrettyPrinter) {
      smartPrettyPrint(level, activeContext, this.options.timestamp !== false, message, ...optionalParams);
    }
    else {
      runner(message, ...optionalParams, activeContext);
    }
  }

  // Static version of the callUnderlying method for static logging calls
  private static callStaticUnderlying(level: LogLevel, message: any, ...optionalParams: any[]) {
    if (!Logger.isLevelEnabled(level))
      return;

    let activeContext: string | undefined;
    if (optionalParams.length > 0 && typeof optionalParams[optionalParams.length - 1] === "string") {
      activeContext = optionalParams.pop();
    }

    if (Logger.isBufferAttached) {
      Logger.logBuffer.push({
        methodRef: () => smartPrettyPrint(level, activeContext, true, message, ...optionalParams),
        arguments: [],
      });
      return;
    }

    const runner = (Logger.staticInstanceRef as any)?.[level] || Logger.staticInstanceRef?.log;
    if (Logger.staticInstanceRef === DefaultPrettyPrinter) {
      smartPrettyPrint(level, activeContext, true, message, ...optionalParams);
    }
    else if (runner) {
      runner(message, ...optionalParams, activeContext);
    }
  }

  // Flushes the log buffer, if any, and detaches the buffer to allow direct logging afterward
  static flush(): void {
    while (Logger.logBuffer.length > 0) {
      const record = Logger.logBuffer.shift();
      if (record)
        record.methodRef(...record.arguments);
    }
    Logger.detachBuffer();
  }

  static attachBuffer(): void {
    Logger.isBufferAttached = true;
  }

  static detachBuffer(): void {
    Logger.isBufferAttached = false;
  }

  static getTimestamp(): string {
    return new Date().toISOString();
  }

  // Method to override the logger implementation, which can accept a LoggerService instance, an array of log levels, or a boolean to enable/disable all logging
  static overrideLogger(logger: LoggerService | LogLevel[] | boolean): any {
    if (Array.isArray(logger)) {
      Logger.logLevels = logger;
      return;
    }
    if (logger === false) {
      Logger.logLevels = [];
      return;
    }
    if (logger === true) {
      Logger.logLevels = [...LOG_LEVELS];
      return;
    }
    Logger.staticInstanceRef = logger;
  }

  static isLevelEnabled(level: LogLevel): boolean {
    return Logger.logLevels ? Logger.logLevels.includes(level) : true;
  }

  private registerLocalInstanceRef() {
    this.localInstanceRef = Logger.staticInstanceRef;
  }
}
