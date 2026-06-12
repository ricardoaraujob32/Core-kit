// apps/api/src/infra/prisma/client.ts

/**
 * Arquivo: apps/api/src/infra/prisma/client.ts
 * Finalidade: Centralizar a criação do PrismaClient.
 *
 * Observação:
 * - Em produção, este cliente é singleton do processo.
 * - Em testes, podemos trocar por outra estratégia.
 */

import { PrismaClient } from "@prisma/client";

declare global {
  // evita recriar cliente em hot reload
  var __clientePrisma__: PrismaClient | undefined;
}

export const clientePrisma =
  global.__clientePrisma__ ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__clientePrisma__ = clientePrisma;
}
