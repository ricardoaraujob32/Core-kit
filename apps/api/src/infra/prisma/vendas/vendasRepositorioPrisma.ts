// apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts

import type { ErroApp, EstoqueId, EstoquePadraoConsultaPorta, HistoricoTransacaoComercial, ItemTransacaoComercial, ItemTransacaoId, LocatarioId, MovimentacaoEstoquePorta,
  ProdutoComercialConsultaPorta, ProdutoId, Result, StatusTransacaoComercial, TipoProduto, TipoTransacaoComercial, TransacaoComercial, TransacaoId, UsuarioId,
  VendasRepositorio } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

type DecimalLike = { toString(): string } | number | string;

type TransacaoRow = {
  transacao_id: string;
  locatario_id: string;
  cliente_id: string | null;
  fornecedor_id: string | null;
  tipo: string;
  origem: string;
  valor: DecimalLike;
  vencimento_em: Date;
  status: string;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
  excluido_por: string | null;
  excluido_motivo: string | null;
};

type ItemTransacaoRow = {
  locatario_id: string;
  item_transacao_id: string;
  transacao_id: string;
  produto_id: string;
  estoque_id: string;
  valor: DecimalLike;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
  excluido_por: string | null;
  excluido_motivo: string | null;
  produtos?: {
    nome: string;
    tipo: string;
  } | null;
};

type ProdutoConsultaRow = {
  produto_id: string;
  nome: string;
  tipo: string;
  ativo: boolean;
  excluido_em: Date | null;
};

const transacaoSelect = {
  transacao_id: true,
  locatario_id: true,
  cliente_id: true,
  fornecedor_id: true,
  tipo: true,
  origem: true,
  valor: true,
  vencimento_em: true,
  status: true,
  criado_em: true,
  atualizado_em: true,
  excluido_em: true,
  excluido_por: true,
  excluido_motivo: true,
} as const;

const itemTransacaoSelect = {
  locatario_id: true,
  item_transacao_id: true,
  transacao_id: true,
  produto_id: true,
  estoque_id: true,
  valor: true,
  criado_em: true,
  atualizado_em: true,
  excluido_em: true,
  excluido_por: true,
  excluido_motivo: true,
  produtos: {
    select: {
      nome: true,
      tipo: true,
    },
  },
} as const;

const produtoConsultaSelect = {
  produto_id: true,
  nome: true,
  tipo: true,
  ativo: true,
  excluido_em: true,
} as const;

/**
 * Histórico transitório em memória.
 *
 * O schema atual ainda não possui tabela de histórico comercial. Este store
 * permite compilar e exercitar o fluxo do Core, mas NÃO atende retenção longa.
 * Quando a tabela definitiva existir, substituir por persistência real.
 */
const historicoTransacoesEmMemoria = new Map<string, HistoricoTransacaoComercial[]>();

function numberFromDecimal(value: DecimalLike): number {
  return typeof value === "number" ? value : Number(value.toString());
}

function normalizarTextoOpcional(value: string | null): string | null {
  const normalizado = value?.trim();
  return normalizado ? normalizado : null;
}

function mapTipoTransacao(tipo: string): TipoTransacaoComercial {
  return tipo.toUpperCase() === "COMPRA" ? "COMPRA" : "VENDA";
}

function mapStatusTransacao(status: string, excluidoEm: Date | null): StatusTransacaoComercial {
  if (excluidoEm) return "CANCELADA";

  switch (status.toUpperCase()) {
    case "RASCUNHO":
    case "ABERTA":
    case "CONFIRMADA":
    case "CONCLUIDA":
    case "CANCELADA":
      return status.toUpperCase() as StatusTransacaoComercial;
    default:
      return "ABERTA";
  }
}

function mapTipoProduto(tipo: string): TipoProduto {
  return tipo.toUpperCase() === "SERVICO" ? "SERVICO" : "PRODUTO";
}

function historicoKey(locatarioId: LocatarioId, transacaoId: TransacaoId): string {
  return `${locatarioId}:${transacaoId}`;
}

function mapTransacao(row: TransacaoRow): TransacaoComercial {
  const valorTotal = numberFromDecimal(row.valor);

  return {
    transacaoId: row.transacao_id as TransacaoId,
    locatarioId: row.locatario_id as LocatarioId,
    tipo: mapTipoTransacao(row.tipo),
    clienteId: row.cliente_id,
    fornecedorId: row.fornecedor_id,
    status: mapStatusTransacao(row.status, row.excluido_em),
    // O schema atual possui apenas `valor`; subtotal/ajustes são derivados.
    valorSubtotal: valorTotal,
    valorDesconto: 0,
    valorAcrescimo: 0,
    valorTotal,
    observacao: null,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    canceladoEm: row.status.toUpperCase() === "CANCELADA" ? row.atualizado_em : null,
    canceladoPor: row.status.toUpperCase() === "CANCELADA" ? (row.excluido_por as UsuarioId | null) : null,
    canceladoMotivo: row.status.toUpperCase() === "CANCELADA" ? row.excluido_motivo : null,
    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  };
}

function mapItem(row: ItemTransacaoRow): ItemTransacaoComercial {
  const valorTotal = numberFromDecimal(row.valor);
  const tipoProduto = mapTipoProduto(row.produtos?.tipo ?? "PRODUTO");

  return {
    itemTransacaoId: row.item_transacao_id as ItemTransacaoId,
    transacaoId: row.transacao_id as TransacaoId,
    locatarioId: row.locatario_id as LocatarioId,
    produtoId: row.produto_id as ProdutoId,
    estoqueId: row.estoque_id as EstoqueId,
    descricao: row.produtos?.nome ?? "Item",
    tipoProduto,
    // O schema atual não possui quantidade/unitário/desconto; mantém equivalente simples.
    quantidade: 1,
    valorUnitario: valorTotal,
    valorDesconto: 0,
    valorTotal,
    movimentaEstoque: tipoProduto === "PRODUTO",
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  };
}

/**
 * Repositório Prisma de transações comerciais.
 *
 * Observações de compatibilidade com o schema atual:
 * - `transacoes.valor` representa `valorTotal`;
 * - `itens_transacao.valor` representa `valorTotal` do item;
 * - quantidade, desconto e preço unitário ainda não são persistidos;
 * - histórico comercial ainda não possui tabela e está temporariamente em memória.
 */
export function createVendasRepositorio(db: PrismaDb): VendasRepositorio {
  return {
    async criarTransacao(transacao): Promise<Result<{ transacaoId: TransacaoId }, ErroApp>> {
      try {
        await db.transacoes.create({
          data: {
            transacao_id: transacao.transacaoId,
            locatario_id: transacao.locatarioId,
            cliente_id: transacao.clienteId,
            fornecedor_id: transacao.fornecedorId,
            ordem_servico_id: null,
            tipo: transacao.tipo,
            origem: "COMERCIAL",
            valor: transacao.valorTotal,
            vencimento_em: transacao.criadoEm,
            status: transacao.status,
            criado_em: transacao.criadoEm,
            atualizado_em: transacao.atualizadoEm,
            excluido_em: transacao.excluidoEm,
            excluido_por: transacao.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(transacao.excluidoMotivo),
          },
        });

        return wrapOk({ transacaoId: transacao.transacaoId });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "transacoes",
          operacao: "infra.vendas.criarTransacao",
          detalhes: {
            transacaoId: transacao.transacaoId,
            locatarioId: transacao.locatarioId,
            tipo: transacao.tipo,
          },
        });
      }
    },

    async buscarTransacaoPorId(params): Promise<Result<TransacaoComercial | null, ErroApp>> {
      try {
        const row = await db.transacoes.findFirst({
          where: {
            transacao_id: params.transacaoId,
            locatario_id: params.locatarioId,
          },
          select: transacaoSelect,
        });

        return wrapOk(row ? mapTransacao(row) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "transacoes",
          operacao: "infra.vendas.buscarTransacaoPorId",
          detalhes: params,
        });
      }
    },

    async listarTransacoes(params): Promise<Result<TransacaoComercial[], ErroApp>> {
      try {
        const rows = await db.transacoes.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            ...(params.tipo ? { tipo: params.tipo } : {}),
            ...(params.status ? { status: params.status } : {}),
          },
          orderBy: { transacao_id: "asc" },
          ...(params.cursor
            ? {
                cursor: {
                  locatario_id_transacao_id: {
                    transacao_id: params.cursor,
                    locatario_id: params.locatarioId,
                  },
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: transacaoSelect,
        });

        return wrapOk(rows.map(mapTransacao));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "transacoes",
          operacao: "infra.vendas.listarTransacoes",
          detalhes: params,
        });
      }
    },

    async atualizarTransacao(transacao): Promise<Result<TransacaoComercial, ErroApp>> {
      try {
        await db.transacoes.update({
          where: {
            locatario_id_transacao_id: {
              transacao_id: transacao.transacaoId,
              locatario_id: transacao.locatarioId,
            },
          },
          data: {
            cliente_id: transacao.clienteId,
            fornecedor_id: transacao.fornecedorId,
            tipo: transacao.tipo,
            valor: transacao.valorTotal,
            status: transacao.status,
            atualizado_em: transacao.atualizadoEm,
            excluido_em: transacao.excluidoEm,
            excluido_por: transacao.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(transacao.excluidoMotivo),
          },
        });

        return wrapOk({
          ...transacao,
          excluidoMotivo: normalizarTextoOpcional(transacao.excluidoMotivo),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "transacoes",
          operacao: "infra.vendas.atualizarTransacao",
          detalhes: {
            transacaoId: transacao.transacaoId,
            locatarioId: transacao.locatarioId,
            status: transacao.status,
          },
        });
      }
    },

    async criarItem(item): Promise<Result<{ itemTransacaoId: ItemTransacaoId }, ErroApp>> {
      try {
        if (!item.estoqueId) {
          return mapearErroInfra(
            new Error("estoqueId é obrigatório para item de transação no schema atual."),
            {
              entidade: "itens_transacao",
              operacao: "vendas.adicionarItem",
              detalhes: {
                locatarioId: item.locatarioId,
                transacaoId: item.transacaoId,
                itemTransacaoId: item.itemTransacaoId,
                produtoId: item.produtoId,
                motivo: "estoque_id_obrigatorio_no_schema_atual",
              },
            },
          );
        }

        await db.itens_transacao.create({
          data: {
            locatario_id: item.locatarioId,
            item_transacao_id: item.itemTransacaoId,
            transacao_id: item.transacaoId,
            produto_id: item.produtoId,
            estoque_id: item.estoqueId,
            valor: item.valorTotal,
            criado_em: item.criadoEm,
            atualizado_em: item.atualizadoEm,
            excluido_em: item.excluidoEm,
            excluido_por: item.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(item.excluidoMotivo),
          },
        });

        return wrapOk({ itemTransacaoId: item.itemTransacaoId });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "itens_transacao",
          operacao: "infra.vendas.criarItem",
          detalhes: {
            itemTransacaoId: item.itemTransacaoId,
            transacaoId: item.transacaoId,
            locatarioId: item.locatarioId,
            produtoId: item.produtoId,
          },
        });
      }
    },

    async buscarItemPorId(params): Promise<Result<ItemTransacaoComercial | null, ErroApp>> {
      try {
        const row = await db.itens_transacao.findFirst({
          where: {
            locatario_id: params.locatarioId,
            transacao_id: params.transacaoId,
            item_transacao_id: params.itemTransacaoId,
          },
          select: itemTransacaoSelect,
        });

        return wrapOk(row ? mapItem(row) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "itens_transacao",
          operacao: "infra.vendas.buscarItemPorId",
          detalhes: params,
        });
      }
    },

    async listarItens(params): Promise<Result<ItemTransacaoComercial[], ErroApp>> {
      try {
        const rows = await db.itens_transacao.findMany({
          where: {
            locatario_id: params.locatarioId,
            transacao_id: params.transacaoId,
            excluido_em: null,
          },
          orderBy: { item_transacao_id: "asc" },
          select: itemTransacaoSelect,
        });

        return wrapOk(rows.map(mapItem));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "itens_transacao",
          operacao: "infra.vendas.listarItens",
          detalhes: params,
        });
      }
    },

    async atualizarItem(item): Promise<Result<ItemTransacaoComercial, ErroApp>> {
      try {
        if (!item.estoqueId) {
          return mapearErroInfra(
            new Error("estoqueId é obrigatório para atualizar item de transação no schema atual."),
            {
              entidade: "itens_transacao",
              operacao: "vendas.atualizarItem",
              detalhes: {
                locatarioId: item.locatarioId,
                transacaoId: item.transacaoId,
                itemTransacaoId: item.itemTransacaoId,
                produtoId: item.produtoId,
                motivo: "estoque_id_obrigatorio_no_schema_atual",
              },
            },
          );
        }

        await db.itens_transacao.update({
          where: {
            locatario_id_transacao_id_item_transacao_id: {
              locatario_id: item.locatarioId,
              item_transacao_id: item.itemTransacaoId,
              transacao_id: item.transacaoId,
            },
          },
          data: {
            produto_id: item.produtoId,
            estoque_id: item.estoqueId,
            valor: item.valorTotal,
            atualizado_em: item.atualizadoEm,
            excluido_em: item.excluidoEm,
            excluido_por: item.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(item.excluidoMotivo),
          },
        });

        return wrapOk({
          ...item,
          excluidoMotivo: normalizarTextoOpcional(item.excluidoMotivo),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "itens_transacao",
          operacao: "infra.vendas.atualizarItem",
          detalhes: {
            itemTransacaoId: item.itemTransacaoId,
            transacaoId: item.transacaoId,
            locatarioId: item.locatarioId,
          },
        });
      }
    },

    async criarHistorico(historico): Promise<Result<{ historicoId: string }, ErroApp>> {
      const key = historicoKey(historico.locatarioId, historico.transacaoId);
      const atual = historicoTransacoesEmMemoria.get(key) ?? [];
      historicoTransacoesEmMemoria.set(key, [...atual, historico]);
      return wrapOk({ historicoId: historico.historicoId });
    },

    async listarHistorico(params): Promise<Result<HistoricoTransacaoComercial[], ErroApp>> {
      const key = historicoKey(params.locatarioId, params.transacaoId);
      return wrapOk([...(historicoTransacoesEmMemoria.get(key) ?? [])]);
    },

    async listarItensPorTransacao(params) {
      return wrapOk([]);
    },

    async removerItem(params) {
      return wrapOk(undefined);
    }
  };
}

/**
 * Consulta do estoque padrão do locatário.
 */
export function createEstoquePadraoConsultaPortaPrisma(db: PrismaDb): EstoquePadraoConsultaPorta {
  return {
    async obterEstoquePadrao(params): Promise<Result<{ estoqueId: EstoqueId } | null, ErroApp>> {
      try {
        const row = await db.estoques.findFirst({
          where: {
            locatario_id: params.locatarioId,
            padrao: true,
            excluido_em: null,
          },
          select: {
            estoque_id: true,
          },
          orderBy: {
            criado_em: "asc",
          },
        });

        return wrapOk(row ? { estoqueId: row.estoque_id as EstoqueId } : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "estoques",
          operacao: "infra.vendas.obterEstoquePadrao",
          detalhes: params,
        });
      }
    },
  };
}

/**
 * Consulta enxuta de produtos para operações comerciais.
 */
export function createProdutoComercialConsultaPortaPrisma(db: PrismaDb): ProdutoComercialConsultaPorta {
  return {
    async buscarProdutoParaTransacao(params): Promise<Result<{
      produtoId: ProdutoId;
      nome: string;
      tipo: "PRODUTO" | "SERVICO";
      status: "ATIVO" | "INATIVO" | "EXCLUIDO";
      precoVenda: number;
      custoReferencia: number | null;
    }, ErroApp>> {
      try {
        const row: ProdutoConsultaRow | null = await db.produtos.findFirst({
          where: {
            produto_id: params.produtoId,
            locatario_id: params.locatarioId,
          },
          select: produtoConsultaSelect,
        });

        if (!row) {
          // O Core atual não tipa retorno nulo nesta porta; devolvemos item inativo para o usecase barrar.
          return wrapOk({
            produtoId: params.produtoId,
            nome: "Produto não encontrado",
            tipo: "PRODUTO",
            status: "EXCLUIDO",
            precoVenda: 0,
            custoReferencia: null,
          });
        }

        return wrapOk({
          produtoId: row.produto_id as ProdutoId,
          nome: row.nome,
          tipo: mapTipoProduto(row.tipo),
          status: row.excluido_em ? "EXCLUIDO" : row.ativo ? "ATIVO" : "INATIVO",
          // O schema atual ainda não possui preço/custo.
          precoVenda: 0,
          custoReferencia: null,
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "produtos",
          operacao: "infra.vendas.buscarProdutoParaTransacao",
          detalhes: params,
        });
      }
    },
  };
}

/**
 * Registra movimentação de estoque associada à conclusão de compra/venda.
 */
export function createMovimentacaoEstoquePortaPrisma(db: PrismaDb): MovimentacaoEstoquePorta {
  return {
    async registrarMovimento(movimento): Promise<Result<void, ErroApp>> {
      try {
        const delta = movimento.tipo === "SAIDA" ? -Math.abs(movimento.quantidade) : Math.abs(movimento.quantidade);

        await db.movimentacoes_estoque.create({
          data: {
            locatario_id: movimento.locatarioId,
            estoque_id: movimento.estoqueId,
            produto_id: movimento.produtoId,
            transacao_id: movimento.transacaoId,
            item_transacao_id: movimento.itemTransacaoId,
            tipo: movimento.tipo,
            delta,
            quantidade: Math.abs(movimento.quantidade),
            ocorrencia_em: movimento.ocorridoEm,
            detalhes: {},
            referencia: movimento.transacaoId,
            observacao: null,
            criado_em: movimento.ocorridoEm,
            criado_por: null,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "movimentos_estoque",
          operacao: "infra.vendas.registrarMovimentoEstoque",
          detalhes: {
            locatarioId: movimento.locatarioId,
            estoqueId: movimento.estoqueId,
            produtoId: movimento.produtoId,
            transacaoId: movimento.transacaoId,
            itemTransacaoId: movimento.itemTransacaoId,
            tipo: movimento.tipo,
            quantidade: movimento.quantidade,
          },
        });
      }
    },
  };
}
