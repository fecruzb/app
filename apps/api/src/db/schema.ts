// Barrel dos schemas de domínio. O drizzle-kit lê este arquivo
// (drizzle.config.ts) — ao criar um domínio novo com tabelas, exporte o
// schema dele aqui para entrar nas migrations.
export * from "../domains/auth/schema";
export * from "../domains/tenant/schema";
export * from "../domains/note/schema";
