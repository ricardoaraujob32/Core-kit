// apps/api/src/infra/auth/authHttpRuntime.ts

import type { EventosSegurancaPorta, HashAuthPorta, IdPorta, JwtAuthPorta, RelogioPorta } from "@core-kit/core";
import { createFnEmitirSessao, createFnResolverContextoAutorizado, createFnRotacionarRefresh, createFnValidarSessao } from "@core-kit/core";
import { hashPorta } from "./hashPorta";
import { jwtPorta } from "./jwtPorta";
import { clientePrisma } from "../client";
import { randomUUID } from "node:crypto";
import { createUsuariosRepositorioAuth } from "./usuarios/usuariosRepositorioAuthPrisma";
import { createLocatariosRepositorioAuth } from "./locatarios/locatariosRepositorioAuthPrisma";
import { createTokensAuthPorta } from "./tokens/tokensAuthPortaPrisma";
import { createRbacAuthPorta } from "./rbac/rbacAuthPortaPrisma";
import { createTransacaoPorta } from "./TransacaoPorta";

/**
 * Runtime padrão da borda HTTP para auth.
 *
 * Responsabilidades:
 * - esconder a composição repetitiva de portas técnicas;
 * - fornecer os grupos de dependência já prontos para os casos de uso do Core;
 * - padronizar a montagem de auth em controllers, guards e builders de contexto.
 *
 * Observação:
 * - este arquivo pertence à borda HTTP;
 * - a composição de infraestrutura mais ampla pode continuar em arquivos
 *   específicos da camada `infra`.
 *
 * @returns Objeto com grupos de dependências prontos para uso em auth.
 */
export function createAuthHttpRuntime() {
  return createAuthDeps( {hashPorta, jwtPorta} );
}

/**
 * Parâmetros de composição do runtime de autenticação.
 *
 * Responsabilidades:
 * - receber as portas técnicas externas (hash/JWT);
 * - opcionalmente permitir sobrescrever relógio, ID e eventos.
 */
type CreateAuthDepsParams = {
  hashPorta: HashAuthPorta;
  jwtPorta: JwtAuthPorta;
  relogio?: RelogioPorta;
  idPorta?: IdPorta;
  eventos?: EventosSegurancaPorta;
};

/**
 * Compõe as dependências concretas da camada de autenticação
 * a partir do Prisma + portas técnicas externas.
 *
 * Grupos montados:
 * - `emitirSessaoDeps`
 * - `rotacionarRefreshDeps`
 * - `validarSessaoDeps`
 * - `resolverContextoAutorizadoDeps`
 *
 * Observação:
 * - este arquivo é o ponto central de wiring da auth;
 * - os controllers/guards não devem montar dependências diretamente.
 *
 * @param params Portas técnicas e dependências opcionais.
 * @returns Objeto com grupos de dependências prontos para os casos de uso do Core.
 */
export function createAuthDeps(params: CreateAuthDepsParams) {
  const prisma = clientePrisma;

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

  const usuariosRepo = createUsuariosRepositorioAuth(prisma);
  const locatariosRepo = createLocatariosRepositorioAuth(prisma);
  const tokensPorta = createTokensAuthPorta(prisma, idPorta);
  const rbacPorta = createRbacAuthPorta(prisma);
  const transacao = createTransacaoPorta(prisma);

  const emitirSessaoDeps = {
    usuariosRepositorio: usuariosRepo,
    locatariosRepositorio: locatariosRepo,
    tokensPorta,
    hashPorta: params.hashPorta,
    jwtPorta: params.jwtPorta,
    relogio,
    idPorta,
    transacao,
    eventos: params.eventos,
  } satisfies Parameters<typeof createFnEmitirSessao>[0];

  const rotacionarRefreshDeps = {
    tokensPorta,
    jwtPorta: params.jwtPorta,
    relogio,
    idPorta,
    transacao,
    eventos: params.eventos,
  } satisfies Parameters<typeof createFnRotacionarRefresh>[0];

  const validarSessaoDeps = {
    jwtPorta: params.jwtPorta,
  } satisfies Parameters<typeof createFnValidarSessao>[0];

  const resolverContextoAutorizadoDeps = {
    rbacPorta,
  } satisfies Parameters<typeof createFnResolverContextoAutorizado>[0];

  return {
    emitirSessaoDeps,
    rotacionarRefreshDeps,
    validarSessaoDeps,
    resolverContextoAutorizadoDeps,
  };
}
