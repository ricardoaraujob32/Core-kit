// apps/api/src/infra/prisma/autorizacao/autorizacaoRuntimeFromDeps.ts

import { createFnListarModulosHabilitados, createFnResolverContextoAutorizado } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import type { AutorizacaoUseCaseDeps } from "./autorizacaoUseCaseDeps.js";

/**
 * 
 * Cria o runtime final de autorização a partir de deps já montadas.
 *
 * Responsabilidades:
 * - instanciar os casos de uso finais da autorização;
 * - expor os blocos de deps usados na composição;
 * - manter um único ponto de wiring para a borda HTTP.
 *
 * @param db 
 * @param deps 
 * @returns 
 */
export function createAutorizacaoRuntimeFromDeps(db: PrismaDb, deps: AutorizacaoUseCaseDeps) {
  return {
    db,
    resolverContextoAutorizadoDeps: deps.resolverContextoAutorizadoDeps,
    listarModulosHabilitadosDeps: deps.listarModulosHabilitadosDeps,
    snapshotDeps: deps.snapshotDeps,
    resolverContextoAutorizado: createFnResolverContextoAutorizado(
      deps.resolverContextoAutorizadoDeps,
    ),
    listarModulosHabilitados: createFnListarModulosHabilitados(
      deps.listarModulosHabilitadosDeps,
    ),
    obterSnapshot: deps.snapshotDeps.autorizacaoRepositorio.obterSnapshot,
  };
}
