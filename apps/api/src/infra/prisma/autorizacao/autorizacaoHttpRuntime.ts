// apps/api/src/infra/prisma/autorizacao/autorizacaoHttpRuntime.ts

import type { PrismaClient } from "@prisma/client";
import { clientePrisma } from "../client.js";
import { AutorizacaoSnapshotCache, autorizacaoSnapshotCache } from "./rbac/autorizacaoSnapshotCache.js";
import { type AutorizacaoPrismaAdapters, createAutorizacaoPrismaAdapters } from "./autorizacaoPrismaAdapters.js";
import { type AutorizacaoUseCaseDeps, createAutorizacaoUseCaseDeps } from "./autorizacaoUseCaseDeps.js";
import { createAutorizacaoRuntimeFromDeps } from "./autorizacaoRuntimeFromDeps.js";

/**
 * 
 */
export type CreateAutorizacaoHttpRuntimeParams = {
  cache?: AutorizacaoSnapshotCache;
};

/**
 * 
 * Runtime base de autorização composto sobre um `db` já fornecido.
 *
 * Regra arquitetural:
 * - este runtime não abre contexto SQL;
 * - ele apenas orquestra adapters e deps da autorização;
 * - a borda HTTP deve consumi-lo como fonte única de wiring.
 *
 * @param db 
 * @param params 
 * @returns 
 */
export function createAutorizacaoRuntimeBase(db: PrismaClient, params: CreateAutorizacaoHttpRuntimeParams = {}) {
  const adapters: AutorizacaoPrismaAdapters = createAutorizacaoPrismaAdapters(db, {
    cache: params.cache,
  });
  const deps: AutorizacaoUseCaseDeps = createAutorizacaoUseCaseDeps(adapters);

  return createAutorizacaoRuntimeFromDeps(db, deps);
}

/**
 * 
 * Runtime oficial de autorização usado pela borda HTTP.
 *
 * @param params 
 * @param prisma 
 * @returns 
 */
export function createAutorizacaoHttpRuntime(params: CreateAutorizacaoHttpRuntimeParams = {}, prisma: PrismaClient = clientePrisma) {
  return createAutorizacaoRuntimeBase(prisma, params);
}

/**
 * Cache singleton padrão da autorização na API.
 */
export const authorizationCache = autorizacaoSnapshotCache;

/**
 * Runtime singleton padrão da autorização na API.
 *
 * Observação:
 * - fase A: centraliza a composição sem introduzir bootstrap ainda;
 * - fase B: o bootstrap poderá assumir a responsabilidade de inicialização.
 */
export const authorizationHttpRuntime = createAutorizacaoHttpRuntime({
  cache: authorizationCache,
});
