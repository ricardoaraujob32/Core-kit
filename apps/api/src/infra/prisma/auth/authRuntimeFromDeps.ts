// apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts

import { createContextoExecucao, createFnEmitirSessao, createFnListarModulosHabilitados, createFnLogout, createFnResolverContextoAutorizado, createFnRotacionarRefresh, createFnValidarSessao, wrapOk } from "@core-kit/core";
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
 *
 * Cria o runtime final de auth a partir de deps já montadas.
 *
 * Responsabilidade:
 * - instanciar os casos de uso finais;
 * - expor os blocos de deps usados na composição;
 * - não montar adapters;
 * - não abrir contexto SQL/RLS.
 *
 * @param db 
 * @param deps 
 * @param technical 
 * @returns 
 */
export function createAuthRuntimeFromDeps(db: PrismaDb | null, deps: AuthUseCaseDeps, technical: AuthRuntimeTechnicalPorts) {
  const validarSessao = createFnValidarSessao(deps.validarSessaoDeps);
  const emitirSessao = createFnEmitirSessao(deps.emitirSessaoDeps);
  const rotacionarRefresh = createFnRotacionarRefresh(deps.rotacionarRefreshDeps);
  const logout = createFnLogout(deps.logoutDeps);
  const listarModulosHabilitados = createFnListarModulosHabilitados(deps.listarModulosHabilitadosDeps);
  
  return {
    db,
    technical,

    emitirSessao,
    rotacionarRefresh,
    validarSessao,
    logout,

    emitirSessaoDeps: deps.emitirSessaoDeps,
    rotacionarRefreshDeps: deps.rotacionarRefreshDeps,
    validarSessaoDeps: deps.validarSessaoDeps,
    logoutDeps: deps.logoutDeps,
    resolverContextoAutorizadoDeps: deps.resolverContextoAutorizadoDeps,
    listarModulosHabilitadosDeps: deps.listarModulosHabilitadosDeps,
    snapshotDeps: deps.snapshotDeps,

    async resolverContextoAutorizado(input: {
      sessao: {
        locatarioId: string;
        usuarioId?: string | null;
        sessionId: string;
        expiraEm: Date;
      };
    }) {
      console.log("[autorizacao.runtime.resolverContextoAutorizado.start]", {
        usuarioId: input.sessao.usuarioId ?? null,
        locatarioId: input.sessao.locatarioId,
        sessionId: input.sessao.sessionId,
        expiraEm: input.sessao.expiraEm,
      });

      if (!input.sessao.usuarioId) {
        console.error("[autorizacao.runtime.resolverContextoAutorizado.err][sem-usuario]", {
          locatarioId: input.sessao.locatarioId,
          sessionId: input.sessao.sessionId,
        });

        throw new Error("resolverContextoAutorizado requer usuarioId.");
      }

      const usuarioId = input.sessao.usuarioId;

      const ctxBase = createContextoExecucao({
        locatarioId: input.sessao.locatarioId,
        usuarioId,
      });

      console.log("[autorizacao.runtime.resolverContextoAutorizado.ctxBase]", {
        usuarioId: ctxBase.usuarioId ?? null,
        locatarioId: ctxBase.locatarioId,
        papeis: ctxBase.papeis ?? [],
        permissoes: ctxBase.permissoes ?? [],
        modulosHabilitados: ctxBase.modulosHabilitados ?? [],
      });

      const modulosResult = await listarModulosHabilitados({
        locatarioId: ctxBase.locatarioId,
      });

      if (!modulosResult.ok) {
        console.error("[auth.runtime.resolverContextoAutorizado.err][modulos]", {
          usuarioId: ctxBase.usuarioId,
          locatarioId: ctxBase.locatarioId,
          erro: modulosResult.error,
        });

        return modulosResult;
      }

      console.log("[auth.runtime.resolverContextoAutorizado.modulos]", {
        usuarioId: ctxBase.usuarioId,
        locatarioId: ctxBase.locatarioId,
        modulos: modulosResult.value.modulos ?? [],
      });

      const snapshot = await deps.snapshotDeps.autorizacaoRepositorio.obterSnapshot({
        locatarioId: ctxBase.locatarioId,
        usuarioId: ctxBase.usuarioId,
        isPlataforma: false,
      });

      if (!snapshot.ok) {
        console.error("[autorizacao.runtime.resolverContextoAutorizado.err][snapshot]", {
          usuarioId: ctxBase.usuarioId,
          locatarioId: ctxBase.locatarioId,
          erro: snapshot.error,
        });

        return snapshot;
      }

      console.log("[autorizacao.runtime.resolverContextoAutorizado.snapshot]", {
        usuarioId: ctxBase.usuarioId,
        locatarioId: ctxBase.locatarioId,
        papeis: snapshot.value.papeis ?? [],
        permissoes: snapshot.value.permissoes ?? [],
        modulos: snapshot.value.modulos ?? [],
      });

      const modulosHabilitados =
        modulosResult.value.modulos?.length > 0
          ? modulosResult.value.modulos
          : (snapshot.value.modulos ?? []);

      const ctx = createContextoExecucao({
        locatarioId: ctxBase.locatarioId,
        usuarioId: ctxBase.usuarioId,
        papeis: snapshot.value.papeis,
        permissoes: snapshot.value.permissoes,
        modulosHabilitados: snapshot.value.modulos,
        agora: ctxBase.agora,
      });

      console.log("[autorizacao.runtime.resolverContextoAutorizado.ok]", {
        usuarioId: ctx.usuarioId ?? null,
        locatarioId: ctx.locatarioId,
        papeis: ctx.papeis ?? [],
        permissoes: ctx.permissoes ?? [],
        modulosHabilitados: ctx.modulosHabilitados ?? [],
      });

      return wrapOk({ ctx });
    },

    listarModulosHabilitados,

    obterSnapshot: deps.snapshotDeps.autorizacaoRepositorio.obterSnapshot,
  };
}
