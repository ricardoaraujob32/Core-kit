// apps/api/src/infra/prisma/autorizacao/autorizacaoPrismaAdapters.ts

import type { PrismaDb } from "../tipos.js";
import type { AutorizacaoSnapshotCache } from "./rbac/autorizacaoSnapshotCache.js";
import { createAutorizacaoRepositorio } from "./rbac/autorizacaoRepositorioPrisma.js";
import { createModulosHabilitadosRepositorio } from "../auth/assinatura/modulosHabilitadosRepositorioPrisma.js";
import { createRbacAuthPorta } from "../auth/rbac/rbacAuthPortaPrisma.js";

/**
 * 
 */
export type CreateAutorizacaoPrismaAdaptersParams = {
  cache?: AutorizacaoSnapshotCache;
};

/**
 * Dependências Prisma da autorização montadas sobre um `db`.
 *
 * Responsabilidades:
 * - centralizar a criação dos adapters concretos usados pela autorização;
 * - manter a composição fora da borda HTTP;
 * - permitir cache customizado para snapshots quando necessário.
 */
export type AutorizacaoPrismaAdapters = {
  autorizacaoRepositorio: ReturnType<typeof createAutorizacaoRepositorio>;
  modulosHabilitadosRepositorio: ReturnType<typeof createModulosHabilitadosRepositorio>;
  rbacPorta: ReturnType<typeof createRbacAuthPorta>;
};

/**
 * 
 * Monta os adapters Prisma necessários para a autorização.
 *
 * @param db 
 * @param params 
 * @returns 
 */
export function createAutorizacaoPrismaAdapters(db: PrismaDb, params: CreateAutorizacaoPrismaAdaptersParams = {}): AutorizacaoPrismaAdapters {
  return {
    autorizacaoRepositorio: createAutorizacaoRepositorio(db, {
      cache: params.cache,
    }),
    modulosHabilitadosRepositorio: createModulosHabilitadosRepositorio(db),
    rbacPorta: createRbacAuthPorta(db),
  };
}
