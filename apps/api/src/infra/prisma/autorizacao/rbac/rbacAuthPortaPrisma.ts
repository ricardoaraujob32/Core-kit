// apps/api/src/infra/prisma/autorizacao/rbac/rbacAuthPortaPrisma.ts

import type { ContextoExecucao, ErroApp, Result, RbacAuthPorta } from "@core-kit/core";
import { createContextoExecucao, wrapOk } from "@core-kit/core";
import { erroInfraAuth } from "../../auth/errosInfraAuth.js"; 
import type { PrismaDb } from "../../tipos.js";
import { createAutorizacaoRepositorio } from "./autorizacaoRepositorioPrisma.js";

/**
 * 
 * @param db 
 * @returns 
 */
export function createRbacAuthPorta(db: PrismaDb): RbacAuthPorta {
  const autorizacaoRepositorio = createAutorizacaoRepositorio(db);

  return {
    async resolverPermissoes(ctxBase: ContextoExecucao): Promise<Result<ContextoExecucao, ErroApp>> {
      try {
        if (!ctxBase.usuarioId) {
          return wrapOk(ctxBase);
        }

        const snapshot = await autorizacaoRepositorio.obterSnapshot({
          locatarioId: ctxBase.locatarioId,
          usuarioId: ctxBase.usuarioId,
          isPlataforma: false,
        });

        if (!snapshot.ok) {
          return snapshot;
        }

        const ctx = createContextoExecucao({
          locatarioId: ctxBase.locatarioId,
          usuarioId: ctxBase.usuarioId,
          papeis: snapshot.value.papeis,
          permissoes: snapshot.value.permissoes,
          modulosHabilitados: snapshot.value.modulos,
          agora: ctxBase.agora,
        });

        return wrapOk(ctx);
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao resolver autorização de autenticação.",
          operacao: "auth.autorizacao.resolverSnapshot",
          causa,
          detalhes: {
            locatarioId: ctxBase.locatarioId,
            usuarioId: ctxBase.usuarioId,
          },
        });
      }
    },
  };
}
