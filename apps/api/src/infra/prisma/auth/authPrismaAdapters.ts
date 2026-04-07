// apps/api/src/infra/prisma/auth/createAuthPrismaAdapters.ts

import type { IdPorta } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { createLocatariosRepositorioAuth } from "./locatario/locatariosRepositorioAuthPrisma";
import { createUsuariosRepositorioAuth } from "./usuario/usuariosRepositorioAuthPrisma";
import { createTokensAuthPorta } from "./tokens/tokensAuthPortaPrisma";
import { createRbacAuthPorta } from "./rbac/rbacAuthPortaPrisma";

/**
 * Dependências Prisma de autenticação montadas sobre um `db`.
 *
 * Este composer concentra somente a criação de adapters/repositórios/portas
 * concretos baseados em Prisma.
 */
export type AuthPrismaAdapters = {
  locatariosRepositorio: ReturnType<typeof createLocatariosRepositorioAuth>;
  usuariosRepositorio: ReturnType<typeof createUsuariosRepositorioAuth>;
  tokensPorta: ReturnType<typeof createTokensAuthPorta>;
  rbacPorta: ReturnType<typeof createRbacAuthPorta>;
};

type CreateAuthPrismaAdaptersParams = {
  idPorta: IdPorta;
};

/**
 * 
 * Monta os adapters Prisma necessários para a auth.
 *
 * Responsabilidade:
 * - criar adapters concretos sobre o `db`;
 * - não montar use cases;
 * - não abrir contexto SQL/RLS.
 *
 * @param db 
 * @param params 
 * @returns 
 */
export function createAuthPrismaAdapters(db: PrismaDb, params: CreateAuthPrismaAdaptersParams): AuthPrismaAdapters {
  return {
    locatariosRepositorio: createLocatariosRepositorioAuth(db),
    usuariosRepositorio: createUsuariosRepositorioAuth(db),
    tokensPorta: createTokensAuthPorta(db, params.idPorta),
    rbacPorta: createRbacAuthPorta(db),
  };
}
