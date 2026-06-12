// apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts

// apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts

import type {
  ErroApp,
  LocatarioId,
  Produto,
  ProdutoId,
  ProdutosRepositorio,
  Result,
  TipoProduto,
  UsuarioId,
} from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

type DecimalLike = { toString(): string } | number | string;

type ProdutoRow = {
  produto_id: string;
  locatario_id: string;
  sku: string | null;
  nome: string;
  unidade: string | null;
  tipo: string;
  ativo: boolean;
  preco_varejo: DecimalLike;
  preco_atacado: DecimalLike | null;
  quantidade_minima_atacado: DecimalLike | null;
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
  preco_varejo: true,
  preco_atacado: true,
  quantidade_minima_atacado: true,
  criado_em: true,
  atualizado_em: true,
  excluido_em: true,
  excluido_por: true,
  excluido_motivo: true,
} as const;

function numberFromDecimal(value: DecimalLike): number {
  return typeof value === "number" ? value : Number(value.toString());
}

function numberFromDecimalNullable(value: DecimalLike | null): number | null {
  return value === null ? null : numberFromDecimal(value);
}

function normalizarTextoOpcional(value: string | null): string | null {
  const normalizado = value?.trim();
  return normalizado ? normalizado : null;
}

function mapTipoProduto(tipo: string): TipoProduto {
  return tipo.toUpperCase() === "SERVICO" ? "SERVICO" : "PRODUTO";
}

function mapProduto(row: ProdutoRow): Produto {
  const precoVarejo = numberFromDecimal(row.preco_varejo);

  return {
    produtoId: row.produto_id as ProdutoId,
    locatarioId: row.locatario_id as LocatarioId,
    sku: row.sku,
    nome: row.nome,
    descricao: null,
    unidade: row.unidade ?? "UN",
    tipo: mapTipoProduto(row.tipo),
    status: row.excluido_em ? "EXCLUIDO" : row.ativo ? "ATIVO" : "INATIVO",

    precoVenda: precoVarejo,
    precoVarejo,
    precoAtacado: numberFromDecimalNullable(row.preco_atacado),
    quantidadeMinimaAtacado: numberFromDecimalNullable(
      row.quantidade_minima_atacado,
    ),

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
 * - `precoVenda` é mantido como alias de compatibilidade para `precoVarejo`;
 * - o schema atual usa `preco_varejo`, `preco_atacado`
 *   e `quantidade_minima_atacado`.
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

            preco_varejo: produto.precoVarejo,
            preco_atacado: produto.precoAtacado,
            quantidade_minima_atacado: produto.quantidadeMinimaAtacado,

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
                  locatario_id_produto_id: {
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
            locatario_id_produto_id: {
              produto_id: produto.produtoId,
              locatario_id: produto.locatarioId,
            },
          },
          data: {
            sku: normalizarTextoOpcional(produto.sku),
            nome: produto.nome,
            unidade: produto.unidade,
            tipo: produto.tipo,

            preco_varejo: produto.precoVarejo,
            preco_atacado: produto.precoAtacado,
            quantidade_minima_atacado: produto.quantidadeMinimaAtacado,

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
          precoVenda: produto.precoVarejo,
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