// apps/api/src/infra/prisma/tipos.ts

import type { PrismaClient, Prisma } from "@prisma/client";

/**
 * Alias padrão para qualquer contexto Prisma aceito pelos adapters:
 * - cliente raiz
 * - transaction client
 */
export type PrismaDb = PrismaClient | Prisma.TransactionClient;
