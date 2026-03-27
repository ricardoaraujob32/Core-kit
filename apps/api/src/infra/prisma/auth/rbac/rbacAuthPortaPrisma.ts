// apps/api/src/infra/prisma/auth/rbac/rbacAuthPortaPrisma.ts

import { RbacAuthPorta, ContextoExecucao, Result, ErroApp, createContextoExecucao, wrapOk, Permissao, Papel } from "@core-kit/core";
import { erroInfraAuth } from "../errosInfraAuth";
import { PrismaDb } from "../../tipos";

/**
 * Adapter Prisma -> RbacAuthPorta.
 *
 * Responsabilidades:
 * - resolver permissões do usuário no contexto do locatário;
 * - enriquecer o ContextoExecucao com RBAC.
 *
 * Observação:
 * - papéis ainda não implementados (placeholder).
 */
export function createRbacAuthPorta(db: PrismaDb): RbacAuthPorta {
  return {
    /**
     * Resolve permissões do usuário e devolve novo contexto.
     *
     * @param ctxBase Contexto base (sem RBAC resolvido).
     * @returns Contexto enriquecido com permissões.
     */
    async resolverPermissoes(ctxBase: ContextoExecucao): Promise<Result<ContextoExecucao, ErroApp>> {
      try {
        const rows = await db.usuarios_permissoes.findMany({
          where: {
            locatario_id: ctxBase.locatarioId,
            usuario_id: ctxBase.usuarioId,
          },
          select: {
            permissao: true,
          },
          orderBy: {
            permissao: "asc",
          },
        });

        const permissoes = rows.map((r) => r.permissao as Permissao);

        /**
         * Quando a estrutura de papéis estiver consolidada na API/BD,
         * encaixe a resolução real aqui.
         */
        const papeis: Papel[] = [];

        const ctx = createContextoExecucao({
          locatarioId: ctxBase.locatarioId,
          usuarioId: ctxBase.usuarioId,
          papeis,
          permissoes,
          modulosHabilitados: ctxBase.modulosHabilitados,
          agora: ctxBase.agora,
        });

        return wrapOk(ctx);
      } catch (causa) {
        return erroInfraAuth("Falha ao resolver permissões de autenticação.", causa, {
          operacao: "auth.rbac.resolverPermissoes",
          locatarioId: ctxBase.locatarioId,
          usuarioId: ctxBase.usuarioId,
        });
      }
    },
  };
}
