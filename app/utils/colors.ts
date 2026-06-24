// utils/colors.ts

export const Colors = {
  // Reset
  reset: "\x1B[0m",

  // Basic Text Colors
  black: "\x1B[30m",
  red: "\x1B[31m",
  green: "\x1B[32m",
  yellow: "\x1B[33m",
  blue: "\x1B[34m",
  magenta: "\x1B[35m",
  cyan: "\x1B[36m",
  white: "\x1B[37m",

  // Bright/Bold Variants
  brightBlack: "\x1B[90m",
  brightRed: "\x1B[91m",
  brightGreen: "\x1B[92m",
  brightYellow: "\x1B[93m",
  brightBlue: "\x1B[94m",
  brightMagenta: "\x1B[95m",
  brightCyan: "\x1B[96m",
  brightWhite: "\x1B[97m",

  // Formatting
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  italic: "\x1B[3m",
  underline: "\x1B[4m",
};

/**
 * Helper to wrap text with color/style and ensure reset
 */
export function colorize(text: string | number, colorCode: string, styleCode: string = "") {
  return `${styleCode}${colorCode}${text}${Colors.reset}`;
}
