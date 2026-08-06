// Contracts shared between API and web, organized by domain.
export * from "./auth";
export * from "./tenant";
export * from "./task";
export * from "./agent";
export * from "./usage";

/** Standard API error shape. */
export type ApiError = {
  error: string;
};
