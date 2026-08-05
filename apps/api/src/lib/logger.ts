// Single logging entry point. Wraps the console for now; swap for a structured logger here.
export const logger = {
  info: (message: string, ...rest: unknown[]) => console.log(message, ...rest),
  warn: (message: string, ...rest: unknown[]) => console.warn(message, ...rest),
  error: (message: string, ...rest: unknown[]) => console.error(message, ...rest),
};
