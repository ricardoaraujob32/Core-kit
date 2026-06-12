// apps/api/src/infra/prisma/auth/authHttpRuntime.ts

import type { EventosSegurancaPorta, HashAuthPorta, IdPorta, JwtAuthPorta, RelogioPorta, TransacaoPorta } from "@core-kit/core";
import { AuthUseCaseDeps, createAuthUseCaseDeps } from "./authUseCaseDeps.js";
import { AuthContextoBanco, executarAuthComContexto } from "./authPrismaContexto.js";
import { hashPorta } from "./hashPorta.js";
import { jwtPorta } from "./jwtPorta.js";
import { createRelogioPorta } from "./relogioPorta.js";
import { createIdPorta } from "./idPorta.js";
import { PrismaDb } from "../tipos.js";
import { AuthPrismaAdapters, createAuthPrismaAdapters } from "./authPrismaAdapters.js";
import { PrismaClient } from "@prisma/client"; 
import { clientePrisma } from "../client.js";
import { createTransacaoPorta } from "./TransacaoPorta.js";
import { AuthRuntimeTechnicalPorts, createAuthRuntimeFromDeps } from "./authRuntimeFromDeps.js";


/**
 * Parâmetros opcionais para composição do runtime técnico da borda.
 */
export type CreateAuthDepsParams = {
  hashPorta?: HashAuthPorta;
  jwtPorta?: JwtAuthPorta;
  relogio?: RelogioPorta;
  idPorta?: IdPorta;
  eventos?: EventosSegurancaPorta;
  transacao?: TransacaoPorta;
};

/**
 * 
 */
type ResolvedAuthTechnicalPorts = AuthRuntimeTechnicalPorts & {
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  eventos?: EventosSegurancaPorta;
};

/**
 * 
 * @param params 
 * @returns 
 */
function resolveAuthTechnicalPorts(params: CreateAuthDepsParams): ResolvedAuthTechnicalPorts {
  return {
    hashPorta: params.hashPorta ?? hashPorta,
    jwtPorta: params.jwtPorta ?? jwtPorta,
    relogio: params.relogio ?? createRelogioPorta(),
    idPorta: params.idPorta ?? createIdPorta(),
    eventos: params.eventos,
  };
}

/**
 * 
 * @param adapters 
 * @param technical 
 * @returns 
 */
function createDepsFromAdapters(adapters: AuthPrismaAdapters, technical: ResolvedAuthTechnicalPorts): AuthUseCaseDeps {
  return createAuthUseCaseDeps({
    adapters,
    hashPorta: technical.hashPorta,
    jwtPorta: technical.jwtPorta,
    relogio: technical.relogio,
    idPorta: technical.idPorta,
    eventos: technical.eventos,
  });
}

/**
 * /**
 * Runtime base de auth composto sobre um `db` já fornecido.
 *
 * Regra arquitetural:
 * - este runtime NÃO abre contexto SQL;
 * - ele apenas orquestra composers;
 * - se o chamador precisar de RLS/contexto, deve abrir isso fora.
 *
 * @param db 
 * @param params 
 * @returns 
 */
export function createAuthRuntimeBase(db: PrismaDb, params: CreateAuthDepsParams = {}) {
  const technical = resolveAuthTechnicalPorts(params);
  const adapters = createAuthPrismaAdapters(db, {
    idPorta: technical.idPorta,
  });
  const deps = createDepsFromAdapters(adapters, technical);

  return createAuthRuntimeFromDeps(db, deps, technical);
}


/**
 * /**
 * Runtime oficial sem contexto explícito.
 *
 * Uso:
 * - login
 * - refresh
 * - validação de sessão
 * - builders que não precisem abrir RLS manualmente
 *
 * @param params 
 * @param prisma 
 * @returns 
 */
export function createAuthHttpRuntime(params: CreateAuthDepsParams = {}, prisma: PrismaClient = clientePrisma) {
  const transacao = params.transacao ?? createTransacaoPorta(prisma);
  const base = createAuthRuntimeBase(prisma, params);

  return {
    ...base,
    transacao,
  };
}

/**
 * /**
 * Executa uma operação de auth dentro de contexto SQL/RLS,
 * compondo um runtime sobre o `tx` contextualizado.
 *
 * Regra arquitetural:
 * - o contexto é aberto aqui, uma única vez;
 * - adapters recebem `tx` já pronto;
 * - o runtime contextualizado reaproveita os mesmos composers do runtime base.
 *
 * @param contexto 
 * @param fn 
 * @param params 
 * @param prisma 
 * @returns 
 */
export async function executarAuthNoContexto<T>(
  contexto: AuthContextoBanco,
  fn: (runtime: ReturnType<typeof createAuthRuntimeBase>) => Promise<T>,
  params: CreateAuthDepsParams = {},
  prisma: PrismaClient = clientePrisma,
): Promise<T> {
  const technical = resolveAuthTechnicalPorts(params);

  return executarAuthComContexto(prisma, contexto, technical.idPorta, async (adapters) => {
      const deps = createDepsFromAdapters(adapters, technical);
      const runtime = createAuthRuntimeFromDeps(null, deps, technical);
      return fn(runtime);
    },
  );
}
