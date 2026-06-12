// apps/api/src/infra/prisma/autorizacao/autorizacaoUseCaseDeps.ts

import { createFnListarModulosHabilitados } from "@core-kit/core";
import type { AutorizacaoPrismaAdapters } from "./autorizacaoPrismaAdapters";

/**
 * 
 */
export type AutorizacaoUseCaseDeps = {
  resolverContextoAutorizadoDeps: {
    rbacPorta: AutorizacaoPrismaAdapters["rbacPorta"];
  };

  listarModulosHabilitadosDeps: Parameters<typeof createFnListarModulosHabilitados>[0];

  snapshotDeps: {
    autorizacaoRepositorio: AutorizacaoPrismaAdapters["autorizacaoRepositorio"];
  };
};

/**
 * 
 * Traduz adapters concretos para os blocos de dependências usados pelo runtime.
 *
 * @param adapters 
 * @returns 
 */
export function createAutorizacaoUseCaseDeps(adapters: AutorizacaoPrismaAdapters): AutorizacaoUseCaseDeps {
  return {
    resolverContextoAutorizadoDeps: {
      rbacPorta: adapters.rbacPorta,
    },
    listarModulosHabilitadosDeps: {
      repositorio: adapters.modulosHabilitadosRepositorio,
    },
    snapshotDeps: {
      autorizacaoRepositorio: adapters.autorizacaoRepositorio,
    },
  };
}
