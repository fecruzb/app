// Contracts shared between API and web, organized by domain.
export * from "./auth";
export * from "./tenant";
export * from "./task";
export * from "./agent";
export * from "./usage";
export * from "./images";
export * from "./admin";
export * from "./billing";

/** Standard API error shape. */
export type ApiError = {
  error: string;
};
