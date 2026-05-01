// apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts

import type { ErroApp, LocatarioId, Produto, ProdutoId, ProdutosRepositorio, Result, TipoProduto, UsuarioId } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

type ProdutoRow = {
  produto_id: string;
  locatario_id: string;
  sku: string | null;
  nome: string;
  unidade: string | null;
  tipo: string;
  ativo: boolean;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
  excluido_por: string | null;
  excluido_motivo: string | null;
};

const produtoSelect = {
  produto_id: true,
  locatario_id: true,
  sku: true,
  nome: true,
  unidade: true,
  tipo: true,
  ativo: true,
  criado_em: true,
  atualizado_em: true,
  excluido_em: true,
  excluido_por: true,
  excluido_motivo: true,
} as const;

function normalizarTextoOpcional(value: string | null): string | null {
  const normalizado = value?.trim();
  return normalizado ? normalizado : null;
}

function mapTipoProduto(tipo: string): TipoProduto {
  return tipo.toUpperCase() === "SERVICO" ? "SERVICO" : "PRODUTO";
}

function mapProduto(row: ProdutoRow): Produto {
  return {
    produtoId: row.produto_id as ProdutoId,
    locatarioId: row.locatario_id as LocatarioId,
    sku: row.sku,
    nome: row.nome,
    // O schema atual não possui `descricao`; mantemos `null` até evoluir o banco.
    descricao: null,
    unidade: row.unidade ?? "UN",
    tipo: mapTipoProduto(row.tipo),
    status: row.excluido_em ? "EXCLUIDO" : row.ativo ? "ATIVO" : "INATIVO",
    // O schema atual não possui preço/custo; valores neutros até evoluir o banco.
    precoVenda: 0,
    custoReferencia: null,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  };
}

/**
 * Repositório Prisma do módulo de produtos/serviços.
 *
 * Observação:
 * - o schema atual ainda não possui `descricao`, `preco_venda` e `custo_referencia`;
 * - o adapter retorna valores neutros para esses campos até a evolução do banco.
 */
export function createProdutosRepositorio(db: PrismaDb): ProdutosRepositorio {
  return {
    async criar(produto): Promise<Result<{ produtoId: ProdutoId }, ErroApp>> {
      try {
        await db.produtos.create({
          data: {
            produto_id: produto.produtoId,
            locatario_id: produto.locatarioId,
            sku: normalizarTextoOpcional(produto.sku),
            nome: produto.nome,
            unidade: produto.unidade,
            tipo: produto.tipo,
            ativo: produto.status === "ATIVO",
            criado_em: produto.criadoEm,
            atualizado_em: produto.atualizadoEm,
            excluido_em: produto.excluidoEm,
            excluido_por: produto.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(produto.excluidoMotivo),
          },
        });

        return wrapOk({ produtoId: produto.produtoId });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "produtos",
          operacao: "infra.produtos.criar",
          detalhes: {
            produtoId: produto.produtoId,
            locatarioId: produto.locatarioId,
            sku: normalizarTextoOpcional(produto.sku),
            tipo: produto.tipo,
          },
        });
      }
    },

    async buscarPorId(params): Promise<Result<Produto | null, ErroApp>> {
      try {
        const row = await db.produtos.findFirst({
          where: {
            produto_id: params.produtoId,
            locatario_id: params.locatarioId,
          },
          select: produtoSelect,
        });

        return wrapOk(row ? mapProduto(row) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "produtos",
          operacao: "infra.produtos.buscarPorId",
          detalhes: params,
        });
      }
    },

    async listarPorLocatario(params): Promise<Result<Produto[], ErroApp>> {
      try {
        const rows = await db.produtos.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            ...(params.tipo ? { tipo: params.tipo } : {}),
          },
          orderBy: { produto_id: "asc" },
          ...(params.cursor
            ? {
                cursor: {
                  produto_id_locatario_id: {
                    produto_id: params.cursor,
                    locatario_id: params.locatarioId,
                  },
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: produtoSelect,
        });

        return wrapOk(rows.map(mapProduto));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "produtos",
          operacao: "infra.produtos.listarPorLocatario",
          detalhes: params,
        });
      }
    },

    async atualizar(produto): Promise<Result<Produto, ErroApp>> {
      try {
        await db.produtos.update({
          where: {
            produto_id_locatario_id: {
              produto_id: produto.produtoId,
              locatario_id: produto.locatarioId,
            },
          },
          data: {
            sku: normalizarTextoOpcional(produto.sku),
            nome: produto.nome,
            unidade: produto.unidade,
            tipo: produto.tipo,
            ativo: produto.status === "ATIVO",
            atualizado_em: produto.atualizadoEm,
            excluido_em: produto.excluidoEm,
            excluido_por: produto.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(produto.excluidoMotivo),
          },
        });

        return wrapOk({
          ...produto,
          sku: normalizarTextoOpcional(produto.sku),
          excluidoMotivo: normalizarTextoOpcional(produto.excluidoMotivo),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "produtos",
          operacao: "infra.produtos.atualizar",
          detalhes: {
            produtoId: produto.produtoId,
            locatarioId: produto.locatarioId,
          },
        });
      }
    },
  };
}
