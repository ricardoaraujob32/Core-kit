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
        if (!ctxBase.usuarioId) {
          return wrapOk(ctxBase);
        }

        const rows = await db.usuarios_papeis.findMany({
          where: {
            locatario_id: ctxBase.locatarioId,
            usuario_id: ctxBase.usuarioId,
          },
          select: {
            papeis: {
              select: {
                codigo: true,
                papel_permissoes: {
                  select: {
                    permissoes: {
                      select: {
                        codigo: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            papel_id: "asc",
          },
        });

        const papeis = Array.from(
          new Set(rows.map((row) => row.papeis.codigo as Papel)),
        );

        const permissoes = Array.from(
          new Set(
            rows.flatMap((row) =>
              row.papeis.papel_permissoes.map(
                (pp) => pp.permissoes.codigo as Permissao,
              ),
            ),
          ),
        ).sort();

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
        return erroInfraAuth({
          mensagem:"Falha ao resolver permissões de autenticação.",
          operacao: "auth.rbac.resolverPermissoes",
          causa,
          detalhes: {
            locatarioId: ctxBase.locatarioId,
            usuarioId: ctxBase.usuarioId,
          }
        });
      }
    },
  };
}
