// apps/api/src/infra/prisma/auth/authHttpRuntime.ts

import { randomUUID } from "node:crypto";
import type {
  EventosSegurancaPorta,
  HashAuthPorta,
  IdPorta,
  JwtAuthPorta,
  RelogioPorta,
  TransacaoPorta,
} from "@core-kit/core";
import {
  createFnEmitirSessao,
  createFnResolverContextoAutorizado,
  createFnRotacionarRefresh,
  createFnValidarSessao,
} from "@core-kit/core";

import type { PrismaClient } from "@prisma/client";
import type { PrismaDb } from "../tipos";
import { clientePrisma } from "../client";

import { hashPorta } from "./hashPorta"; 
import { jwtPorta } from "./jwtPorta"; 
import { createTransacaoPorta } from "./TransacaoPorta"; 

import { createUsuariosRepositorioAuth } from "./usuario/usuariosRepositorioAuthPrisma";
import { createLocatariosRepositorioAuth } from "./locatario/locatariosRepositorioAuthPrisma";
import { createTokensAuthPorta } from "./tokens/tokensAuthPortaPrisma";
import { createRbacAuthPorta } from "./rbac/rbacAuthPortaPrisma";
import {
  executarAuthComContexto,
  type AuthContextoBanco,
} from "./createAuthPrismaContexto";

/**
 * Parâmetros opcionais para composição do runtime técnico da borda.
 */
type CreateAuthDepsParams = {
  hashPorta?: HashAuthPorta;
  jwtPorta?: JwtAuthPorta;
  relogio?: RelogioPorta;
  idPorta?: IdPorta;
  eventos?: EventosSegurancaPorta;
  transacao?: TransacaoPorta;
};

/**
 * Runtime base de auth composto sobre um `db` já fornecido.
 *
 * Regra arquitetural:
 * - este runtime NÃO abre contexto SQL;
 * - ele apenas compõe adapters e casos de uso;
 * - se o chamador precisar de RLS/contexto, deve abrir isso fora.
 *
 * @param db 
 * @param params 
 * @returns 
 */
export function createAuthRuntimeBase(db: PrismaDb, params: CreateAuthDepsParams = {}) {
  const relogio: RelogioPorta =
    params.relogio ??
    ({
      agora: () => new Date(),
    } satisfies RelogioPorta);

  const idPorta: IdPorta =
    params.idPorta ??
    ({
      gerarId: () => randomUUID(),
    } satisfies IdPorta);

  const locatariosRepositorio = createLocatariosRepositorioAuth(db);
  const usuariosRepositorio = createUsuariosRepositorioAuth(db);
  const tokensPorta = createTokensAuthPorta(db, idPorta);
  const rbacPorta = createRbacAuthPorta(db);

  const emitirSessaoDeps = {
    usuariosRepositorio,
    locatariosRepositorio,
    tokensPorta,
    hashPorta: params.hashPorta ?? hashPorta,
    jwtPorta: params.jwtPorta ?? jwtPorta,
    relogio,
    idPorta,
    eventos: params.eventos,
  } satisfies Parameters<typeof createFnEmitirSessao>[0];

  const rotacionarRefreshDeps = {
    tokensPorta,
    jwtPorta: params.jwtPorta ?? jwtPorta,
    relogio,
    idPorta,
    eventos: params.eventos,
  } satisfies Parameters<typeof createFnRotacionarRefresh>[0];

  const validarSessaoDeps = {
    jwtPorta: params.jwtPorta ?? jwtPorta,
  } satisfies Parameters<typeof createFnValidarSessao>[0];

  const resolverContextoAutorizadoDeps = {
    rbacPorta,
  } satisfies Parameters<typeof createFnResolverContextoAutorizado>[0];

  return {
    db,
    relogio,
    idPorta,
    emitirSessaoDeps,
    rotacionarRefreshDeps,
    validarSessaoDeps,
    resolverContextoAutorizadoDeps,
    emitirSessao: createFnEmitirSessao(emitirSessaoDeps),
    rotacionarRefresh: createFnRotacionarRefresh(rotacionarRefreshDeps),
    validarSessao: createFnValidarSessao(validarSessaoDeps),
    resolverContextoAutorizado: createFnResolverContextoAutorizado(resolverContextoAutorizadoDeps),
  };
}

/**
 * Runtime oficial sem contexto explícito.
 *
 * Uso:
 * - login
 * - refresh
 * - validação de sessão
 * - builders que não precisem abrir RLS manualmente
 *
 * @param params 
 * @returns 
 */
export function createAuthHttpRuntime(params: CreateAuthDepsParams = {}) {
  const prisma = clientePrisma;
  const transacao = params.transacao ?? createTransacaoPorta(prisma);

  const base = createAuthRuntimeBase(prisma, params);

  return {
    ...base,
    transacao,
  };
}

/**
 * Executa uma operação de auth dentro de contexto SQL/RLS,
 * compondo um runtime sobre o `tx` contextualizado.
 *
 * Regra arquitetural:
 * - o contexto é aberto aqui, uma única vez;
 * - adapters recebem `tx` já pronto;
 * - nenhum adapter de auth deve abrir contexto por conta própria.
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
  const idPorta: IdPorta =
    params.idPorta ??
    ({
      gerarId: () => randomUUID(),
    } satisfies IdPorta);

  return executarAuthComContexto(
    prisma,
    contexto,
    idPorta,
    async (deps) => {
      const runtime = createAuthRuntimeBase(
        {
          ...("locatariosRepositorioAuth" in deps ? {} : {}),
          // placeholder apenas para deixar claro que usamos `tx` via adapters abaixo
        } as never,
        params,
      );

      /**
       * Recompõe o runtime sobre os adapters contextualizados.
       * Aqui evitamos recriar contexto; só trocamos os adapters pelo conjunto baseado em `tx`.
       */
      const relogio: RelogioPorta =
        params.relogio ??
        ({
          agora: () => new Date(),
        } satisfies RelogioPorta);

      const emitirSessaoDeps = {
        usuariosRepositorio: deps.usuariosRepositorioAuth,
        locatariosRepositorio: deps.locatariosRepositorioAuth,
        tokensPorta: deps.tokensAuthPorta,
        hashPorta: params.hashPorta ?? hashPorta,
        jwtPorta: params.jwtPorta ?? jwtPorta,
        relogio,
        idPorta,
        eventos: params.eventos,
      } satisfies Parameters<typeof createFnEmitirSessao>[0];

      const rotacionarRefreshDeps = {
        tokensPorta: deps.tokensAuthPorta,
        jwtPorta: params.jwtPorta ?? jwtPorta,
        relogio,
        idPorta,
        eventos: params.eventos,
      } satisfies Parameters<typeof createFnRotacionarRefresh>[0];

      const validarSessaoDeps = {
        jwtPorta: params.jwtPorta ?? jwtPorta,
      } satisfies Parameters<typeof createFnValidarSessao>[0];

      const resolverContextoAutorizadoDeps = {
        rbacPorta: deps.rbacAuthPorta,
      } satisfies Parameters<typeof createFnResolverContextoAutorizado>[0];

      return fn({
        db: null as never,
        relogio,
        idPorta,
        emitirSessaoDeps,
        rotacionarRefreshDeps,
        validarSessaoDeps,
        resolverContextoAutorizadoDeps,
        emitirSessao: createFnEmitirSessao(emitirSessaoDeps),
        rotacionarRefresh: createFnRotacionarRefresh(rotacionarRefreshDeps),
        validarSessao: createFnValidarSessao(validarSessaoDeps),
        resolverContextoAutorizado: createFnResolverContextoAutorizado(resolverContextoAutorizadoDeps),
      });
    },
  );
}
