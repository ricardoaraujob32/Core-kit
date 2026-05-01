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
      return "PLANO";
    case "MANUAL":
      return "MANUAL";
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

function normalizarCodigo<T extends string>(codigo: T): T {
  return codigo.trim() as T;
}

type CreateAutorizacaoRepositorioParams = {
  cache?: AutorizacaoSnapshotCache;
};

/**
 * 
 * @param db 
 * @param params 
 * @returns 
 */
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
        console.log("🔥 RBAC REPOSITORIO CARREGADO 🔥", {
          locatarioId,
          usuarioId,
          isPlataforma,
        });

        const cached = cache.get({
          locatarioId,
          usuarioId,
          isPlataforma,
        });

        console.log("🔥 SNAPSHOT CACHE RESULT 🔥", {
          locatarioId,
          usuarioId,
          isPlataforma,
          hit: !!cached,
        });

        if (cached) {
          console.info("[autorizacao.snapshot] cacheHit", {
            locatarioId,
            usuarioId,
            isPlataforma,
            snapshot: cached,
          });
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

          // Importante:
          // nesta versão, a resolução de módulos parte diretamente da tabela
          // modulos_assinatura. Isso evita falso-negativo causado por filtro
          // relacional excessivo em `assinaturas` durante a depuração.
          db.modulos_assinatura.findMany({
            where: {
              locatario_id: locatarioId,
              habilitado: true,
            },
            select: {
              origem: true,
              modulo_id: true,
              assinatura_id: true,
              modulos: {
                select: {
                  codigo: true,
                  ativo: true,
                },
              },
              assinaturas: {
                select: {
                  assinatura_id: true,
                  locatario_id: true,
                  status: true,
                  excluido_em: true,
                },
              },
            },
            orderBy: [
              { assinatura_id: "asc" },
              { modulo_id: "asc" },
            ],
          }),
        ]);

        console.info("[autorizacao.snapshot] rowsPapeis", {
          locatarioId,
          usuarioId,
          quantidade: rowsPapeis.length,
          itens: rowsPapeis.map((row) => ({
            papelCodigo: row.papeis.codigo,
            permissoes: row.papeis.papel_permissoes.map(
              (pp) => pp.permissoes.codigo,
            ),
          })),
        });

        console.info("[autorizacao.snapshot] rowsModulos.raw", {
          locatarioId,
          usuarioId,
          quantidade: rowsModulos.length,
          itens: rowsModulos.map((row) => ({
            assinaturaId: row.assinatura_id,
            moduloId: row.modulo_id,
            codigo: row.modulos.codigo,
            moduloAtivo: row.modulos.ativo,
            origem: row.origem,
            assinaturaStatus: row.assinaturas?.status ?? null,
            assinaturaExcluida: row.assinaturas?.excluido_em ?? null,
            assinaturaLocatarioId: row.assinaturas?.locatario_id ?? null,
          })),
        });

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
          if (!vinculo.modulos.ativo) {
            console.info("[autorizacao.snapshot] moduloIgnorado", {
              motivo: "modulo_inativo",
              codigo: vinculo.modulos.codigo,
              moduloId: vinculo.modulo_id,
            });
            continue;
          }

          if (vinculo.assinaturas.excluido_em) {
            console.info("[autorizacao.snapshot] moduloIgnorado", {
              motivo: "assinatura_excluida",
              codigo: vinculo.modulos.codigo,
              assinaturaId: vinculo.assinatura_id,
            });
            continue;
          }

          if (vinculo.assinaturas.status !== "ATIVA") {
            console.info("[autorizacao.snapshot] moduloIgnorado", {
              motivo: "assinatura_inativa",
              codigo: vinculo.modulos.codigo,
              assinaturaId: vinculo.assinatura_id,
              status: vinculo.assinaturas.status,
            });
            continue;
          }

          if (vinculo.assinaturas.locatario_id !== locatarioId) {
            console.info("[autorizacao.snapshot] moduloIgnorado", {
              motivo: "locatario_assinatura_divergente",
              codigo: vinculo.modulos.codigo,
              assinaturaId: vinculo.assinatura_id,
              assinaturaLocatarioId: vinculo.assinaturas.locatario_id,
              locatarioIdEsperado: locatarioId,
            });
            continue;
          }

          const codigo = vinculo.modulos.codigo.trim().toUpperCase();
          const origem = normalizarOrigemModulo(vinculo.origem);

          const atual = porCodigo.get(codigo);
          if (
            !atual ||
            prioridadeOrigem(origem) > prioridadeOrigem(atual.origem)
          ) {
            porCodigo.set(codigo, { codigo, origem });
          }
        }

        const modulos = Array.from(porCodigo.keys()).sort((a, b) =>
          a.localeCompare(b),
        );

        console.info("[autorizacao.snapshot] modulosFinal", {
          locatarioId,
          usuarioId,
          modulos,
        });

        const snapshot: AutorizacaoSnapshot = {
          locatarioId,
          usuarioId,
          papeis,
          permissoes,
          modulos,
        };

        console.info("[autorizacao.snapshot] snapshotFinal", snapshot);

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
        console.error("[autorizacao.snapshot] erro", {
          locatarioId,
          usuarioId,
          isPlataforma,
          causa,
        });

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

