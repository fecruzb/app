// Ponto único de log. Hoje envelopa o console; troque por pino/estruturado
// aqui sem tocar no resto do código.
export const logger = {
  info: (message: string, ...rest: unknown[]) => console.log(message, ...rest),
  warn: (message: string, ...rest: unknown[]) => console.warn(message, ...rest),
  error: (message: string, ...rest: unknown[]) => console.error(message, ...rest),
};
