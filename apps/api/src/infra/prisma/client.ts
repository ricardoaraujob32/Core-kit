/**
 * Arquivo: apps/api/src/infra/prisma/client.ts
 * Finalidade: Centralizar a criação do PrismaClient.
 *
 * Observação:
 * - Em produção, este cliente é singleton do processo.
 * - Em testes, podemos trocar por outra estratégia.
 */

import { PrismaClient } from "@prisma/client";

export const clientePrisma = new PrismaClient();
