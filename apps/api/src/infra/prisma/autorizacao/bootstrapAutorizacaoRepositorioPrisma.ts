// apps/api/src/infra/prisma/autorizacao/bootstrapAutorizacaoRepositorioPrisma.ts

import { wrapOk } from "@core-kit/core";
import type { BootstrapAutorizacaoRepositorio, CatalogoAutorizacaoBootstrap } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

/**
 *
 * Repositório Prisma do catálogo global de autorização.
 *
 * Responsabilidades:
 * - carregar permissões canônicas;
 * - carregar papéis canônicos;
 * - carregar módulos canônicos;
 * - não carregar vínculos fracos/contextuais.
 *
 * @param db 
 * @returns 
 */
export function createBootstrapAutorizacaoRepositorio(db: PrismaDb): BootstrapAutorizacaoRepositorio {
  return {
    async carregarCatalogo() {
      try {
        const [permissoesRows, papeisRows, modulosRows] = await Promise.all([
          db.permissoes.findMany({
            select: {
              codigo: true,
              descricao: true,
            },
            orderBy: {
              codigo: "asc",
            },
          }),
          db.papeis.findMany({
            select: {
              codigo: true,
              descricao: true,
            },
            orderBy: {
              codigo: "asc",
            },
          }),
          db.modulos.findMany({
            select: {
              codigo: true,
              nome: true,
              ativo: true,
            },
            orderBy: {
              codigo: "asc",
            },
          }),
        ]);

        const catalogo: CatalogoAutorizacaoBootstrap = {
          permissoes: permissoesRows.map((row) => ({
            codigo: row.codigo.trim(),
            descricao: row.descricao ?? null,
          })),
          papeis: papeisRows.map((row) => ({
            codigo: row.codigo.trim(),
            descricao: row.descricao ?? null,
          })),
          modulos: modulosRows.map((row) => ({
            codigo: row.codigo.trim().toUpperCase(),
            nome: row.nome ?? null,
            ativo: row.ativo,
          })),
        };

        return wrapOk(catalogo);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "catalogo_autorizacao",
          operacao: "infra.prisma.autorizacaoBootstrap.carregarCatalogo",
        });
      }
    },
  };
}
