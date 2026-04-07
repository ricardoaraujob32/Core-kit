// apps/api/src/infra/prisma/auth/createAuthRuntimeFromDeps.ts

import { createFnEmitirSessao, createFnResolverContextoAutorizado, createFnRotacionarRefresh, createFnValidarSessao } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import type { AuthUseCaseDeps } from "./authUseCaseDeps";
import type { IdPorta, RelogioPorta } from "@core-kit/core";

/**
 * Portas técnicas já resolvidas para a composição do runtime.
 */
export type AuthRuntimeTechnicalPorts = {
  relogio: RelogioPorta;
  idPorta: IdPorta;
};

/**
 * Cria o runtime final de auth a partir de deps já montadas.
 *
 * Responsabilidade:
 * - instanciar os casos de uso finais;
 * - expor os blocos de deps usados na composição;
 * - não montar adapters;
 * - não abrir contexto SQL/RLS.
 */
export function createAuthRuntimeFromDeps(
  db: PrismaDb | null,
  deps: AuthUseCaseDeps,
  technical: AuthRuntimeTechnicalPorts,
) {
  return {
    db,
    relogio: technical.relogio,
    idPorta: technical.idPorta,
    emitirSessaoDeps: deps.emitirSessaoDeps,
    rotacionarRefreshDeps: deps.rotacionarRefreshDeps,
    validarSessaoDeps: deps.validarSessaoDeps,
    resolverContextoAutorizadoDeps: deps.resolverContextoAutorizadoDeps,
    emitirSessao: createFnEmitirSessao(deps.emitirSessaoDeps),
    rotacionarRefresh: createFnRotacionarRefresh(deps.rotacionarRefreshDeps),
    validarSessao: createFnValidarSessao(deps.validarSessaoDeps),
    resolverContextoAutorizado: createFnResolverContextoAutorizado(
      deps.resolverContextoAutorizadoDeps,
    ),
  };
}