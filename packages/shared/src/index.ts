// Contratos compartilhados entre API e web, organizados por domínio.
export * from "./auth";
export * from "./tenant";
export * from "./note";
export * from "./agent";

/** Formato padrão de erro da API. */
export type ApiError = {
  error: string;
};
