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
  console.log("[auth.rbac.porta.init]", {
    arquivo: "apps/api/src/infra/prisma/auth/rbac/rbacAuthPortaPrisma.ts",
  });

  return {
    /**
     * Resolve permissões do usuário e devolve novo contexto.
     *
     * @param ctxBase Contexto base (sem RBAC resolvido).
     * @returns Contexto enriquecido com permissões.
     */
    async resolverPermissoes(ctxBase: ContextoExecucao): Promise<Result<ContextoExecucao, ErroApp>> {
      try {
        console.log("[auth.rbac.resolverPermissoes.start]", {
          usuarioId: ctxBase.usuarioId ?? null,
          locatarioId: ctxBase.locatarioId,
          papeis: ctxBase.papeis ?? [],
          permissoes: ctxBase.permissoes ?? [],
          modulosHabilitados: ctxBase.modulosHabilitados ?? [],
        });

        if (!ctxBase.usuarioId) {
          console.log("[auth.rbac.resolverPermissoes.skip][sem-usuario]", {
            locatarioId: ctxBase.locatarioId,
          });

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

        console.log("[auth.rbac.resolverPermissoes.rows]", {
          usuarioId: ctxBase.usuarioId,
          locatarioId: ctxBase.locatarioId,
          quantidade: rows.length,
          itens: rows.map((row) => ({
            papelCodigo: row.papeis.codigo,
            permissoes: row.papeis.papel_permissoes.map((pp) => pp.permissoes.codigo),
          })),
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

        console.log("[auth.rbac.resolverPermissoes.resolvido]", {
          usuarioId: ctxBase.usuarioId,
          locatarioId: ctxBase.locatarioId,
          papeis,
          permissoes,
          modulosHabilitadosEntrada: ctxBase.modulosHabilitados ?? [],
        });

        const ctx = createContextoExecucao({
          locatarioId: ctxBase.locatarioId,
          usuarioId: ctxBase.usuarioId,
          papeis,
          permissoes,
          modulosHabilitados: ctxBase.modulosHabilitados,
          agora: ctxBase.agora,
        });

        console.log("[auth.rbac.resolverPermissoes.ok]", {
          usuarioId: ctx.usuarioId ?? null,
          locatarioId: ctx.locatarioId,
          papeis: ctx.papeis ?? [],
          permissoes: ctx.permissoes ?? [],
          modulosHabilitados: ctx.modulosHabilitados ?? [],
        });

        return wrapOk(ctx);
      } catch (causa) {
        const erro = erroInfraAuth({
          mensagem: "Falha ao resolver permissões de autenticação.",
          operacao: "auth.rbac.resolverPermissoes",
          causa,
          detalhes: {
            locatarioId: ctxBase.locatarioId,
            usuarioId: ctxBase.usuarioId,
          }
        });

        console.error("[auth.rbac.resolverPermissoes.err]", {
          usuarioId: ctxBase.usuarioId ?? null,
          locatarioId: ctxBase.locatarioId,
          causa,
          erro,
        });

        return erro;
      }
    },
  };
}
