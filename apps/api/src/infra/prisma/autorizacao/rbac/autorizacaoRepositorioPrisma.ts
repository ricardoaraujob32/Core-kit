// apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts

import type { AutorizacaoRepositorio, AutorizacaoSnapshot, LocatarioId, ModuloHabilitado, OrigemModuloHabilitado, Papel, Permissao, UsuarioId } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../../tipos";
import { mapearErroInfra } from "../../erros";
import { AutorizacaoSnapshotCache, autorizacaoSnapshotCache } from "./autorizacaoSnapshotCache";

function normalizarOrigemModulo(origem: string | null | undefined): OrigemModuloHabilitado {
  switch ((origem ?? "").trim().toUpperCase()) {
    case "SISTEMA":
      return "SISTEMA";
    case "PLANO":
    case "PLANO_SUGERIDO":
      return "PLANO";
    case "MANUAL":
    case "MANUAL_SUPERADMIN":
    case "ADDON":
    case "CORTESIA":
    default:
      return "MANUAL";
  }
}

function prioridadeOrigem(origem: OrigemModuloHabilitado): number {
  switch (origem) {
    case "SISTEMA":
      return 3;
    case "MANUAL":
      return 2;
    case "PLANO":
    default:
      return 1;
  }
}

type CreateAutorizacaoRepositorioParams = {
  cache?: AutorizacaoSnapshotCache;
};

type RowModuloRbac = {
  modulo_id: string;
  codigo: string;
  ativo: boolean;
  origem: string;
};

export function createAutorizacaoRepositorio(
  db: PrismaDb,
  params: CreateAutorizacaoRepositorioParams = {},
): AutorizacaoRepositorio {
  const cache = params.cache ?? autorizacaoSnapshotCache;

  return {
    async obterSnapshot({
      locatarioId,
      usuarioId,
      isPlataforma = false,
    }: {
      locatarioId: LocatarioId;
      usuarioId: UsuarioId;
      isPlataforma?: boolean;
    }) {
      try {
        const cached = cache.get({
          locatarioId,
          usuarioId,
          isPlataforma,
        });

        if (cached) {
          return wrapOk(cached);
        }

        const [rowsPapeis, rowsModulos] = await Promise.all([
          db.usuarios_papeis.findMany({
            where: {
              locatario_id: locatarioId,
              usuario_id: usuarioId,
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
          }),

          db.$queryRaw<RowModuloRbac[]>`
            SELECT
              ml.modulo_id,
              m.codigo,
              m.ativo,
              ml.origem::text AS origem
            FROM core.modulos_locatario ml
            JOIN core.modulos m
              ON m.modulo_id = ml.modulo_id
            WHERE ml.locatario_id = ${locatarioId}::uuid
              AND ml.habilitado = true
            ORDER BY m.codigo ASC
          `,
        ]);

        const papeis = Array.from(
          new Set(rowsPapeis.map((row) => row.papeis.codigo as Papel)),
        ).sort();

        const permissoes = Array.from(
          new Set(
            rowsPapeis.flatMap((row) =>
              row.papeis.papel_permissoes.map(
                (pp) => pp.permissoes.codigo as Permissao,
              ),
            ),
          ),
        ).sort();

        const porCodigo = new Map<string, ModuloHabilitado>();

        for (const vinculo of rowsModulos) {
          if (!vinculo.ativo) {
            continue;
          }

          const codigo = vinculo.codigo.trim().toUpperCase();
          const origem = normalizarOrigemModulo(vinculo.origem);

          const atual = porCodigo.get(codigo);
          if (!atual || prioridadeOrigem(origem) > prioridadeOrigem(atual.origem)) {
            porCodigo.set(codigo, { codigo, origem });
          }
        }

        const modulos = Array.from(porCodigo.keys()).sort((a, b) =>
          a.localeCompare(b),
        );

        const snapshot: AutorizacaoSnapshot = {
          locatarioId,
          usuarioId,
          papeis,
          permissoes,
          modulos,
        };

        cache.set(
          {
            locatarioId,
            usuarioId,
            isPlataforma,
          },
          snapshot,
        );

        return wrapOk(snapshot);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "autorizacao",
          operacao: "infra.prisma.autorizacao.obterSnapshot",
          detalhes: {
            locatarioId,
            usuarioId,
            isPlataforma,
          },
        });
      }
    },
  };
}