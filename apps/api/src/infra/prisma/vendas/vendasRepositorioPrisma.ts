// apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts

import type { ErroApp, EstoqueId, EstoquePadraoConsultaPorta, HistoricoTransacaoComercial, ItemTransacaoComercial, ItemTransacaoId, LocatarioId, MovimentacaoEstoquePorta,
  ProdutoComercialConsultaPorta, ProdutoId, Result, StatusTransacaoComercial, TipoProduto, TipoTransacaoComercial, TransacaoComercial, TransacaoId, UsuarioId,
  VendasRepositorio, MovimentoEstoqueComercial } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

type DecimalLike = { toString(): string } | number | string;

type TransacaoRow = {
  transacao_id: string;
  locatario_id: string;
  cliente_id: string | null;
  fornecedor_id: string | null;
  tipo: string;
  origem: string;
  valor_subtotal: DecimalLike | null;
  valor_desconto: DecimalLike | null;
  valor_acrescimo: DecimalLike | null;
  valor_total: DecimalLike | null;
  observacao: string | null;
  vencimento_em: Date;
  status: string;
  criado_em: Date;
  atualizado_em: Date;
  cancelado_em: Date | null;
  cancelado_por: string | null;
  cancelado_motivo: string | null;
  excluido_em: Date | null;
  excluido_por: string | null;
  excluido_motivo: string | null;
};

type ItemTransacaoRow = {
  locatario_id: string;
  item_transacao_id: string;
  transacao_id: string;
  produto_id: string;
  estoque_id: string | null;
  descricao: string | null;
  tipo_produto: string | null;
  quantidade: DecimalLike | null;
  valor_unitario: DecimalLike | null;
  valor_subtotal: DecimalLike | null;
  valor_desconto: DecimalLike | null;
  valor_acrescimo: DecimalLike | null;
  valor_total: DecimalLike | null;
  movimenta_estoque: boolean | null;
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
  preco_varejo: DecimalLike;
  preco_atacado: DecimalLike | null;
  quantidade_minima_atacado: DecimalLike | null;
};

type ItemTransacaoComValoresParciais = ItemTransacaoComercial & {
  valorSubtotal?: number;
  valorAcrescimo?: number;
};

const transacaoSelect = {
  transacao_id: true,
  locatario_id: true,
  cliente_id: true,
  fornecedor_id: true,
  tipo: true,
  origem: true,
  valor_subtotal: true,
  valor_desconto: true,
  valor_acrescimo: true,
  valor_total: true,
  observacao: true,
  vencimento_em: true,
  status: true,
  criado_em: true,
  atualizado_em: true,
  cancelado_em: true,
  cancelado_por: true,
  cancelado_motivo: true,
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
  descricao: true,
  tipo_produto: true,
  quantidade: true,
  valor_unitario: true,
  valor_subtotal: true,
  valor_desconto: true,
  valor_acrescimo: true,
  valor_total: true,
  movimenta_estoque: true,
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
  preco_varejo: true,
  preco_atacado: true,
  quantidade_minima_atacado: true,
} as const;

/**
 * Histórico transitório em memória.
 *
 * O schema atual ainda não possui tabela de histórico comercial. Este store
 * permite compilar e exercitar o fluxo do Core, mas NÃO atende retenção longa.
 * Quando a tabela definitiva existir, substituir por persistência real.
 */
const historicoTransacoesEmMemoria = new Map<string, HistoricoTransacaoComercial[]>();

function numberFromDecimal(value: DecimalLike | null | undefined, fallback = 0): number {
  if (value === null || value === undefined) return fallback;

  const numero = typeof value === "number" ? value : Number(value.toString());

  return Number.isFinite(numero) ? numero : fallback;
}

function normalizarTextoOpcional(value?: string | null): string | null {
  const normalizado = value?.trim();
  return normalizado ? normalizado : null;
}

function mapTipoTransacao(tipo: string): TipoTransacaoComercial {
  return tipo.toUpperCase() === "COMPRA" ? "COMPRA" : "VENDA";
}

function mapStatusTransacaoParaDb(status: string) {
  switch (status) {
    case "RASCUNHO":
      return "ABERTA";

    case "ABERTA":
      return "ABERTA";

    case "CONFIRMADA":
      return "EM_PROCESSAMENTO";

    case "CONCLUIDA":
      return "CONCLUIDA";

    case "CANCELADA":
      return "CANCELADA";

    default:
      return status;
  }
}

function mapStatusTransacaoParaDominio(status: string): StatusTransacaoComercial {
  switch (status) {
    case "ABERTA":
      return "RASCUNHO";

    case "EM_PROCESSAMENTO":
      return "CONFIRMADA";

    case "CONCLUIDA":
      return "CONCLUIDA";

    case "CANCELADA":
      return "CANCELADA";

    default:
      return "RASCUNHO";
  }
}

function mapTipoProduto(tipo: string): TipoProduto {
  return tipo.toUpperCase() === "SERVICO" ? "SERVICO" : "PRODUTO";
}

function historicoKey(locatarioId: LocatarioId, transacaoId: TransacaoId): string {
  return `${locatarioId}:${transacaoId}`;
}

function getValorSubtotalItem(item: ItemTransacaoComercial): number {
  const itemComParciais = item as ItemTransacaoComValoresParciais;

  return itemComParciais.valorSubtotal ?? item.quantidade * item.valorUnitario;
}

function getValorAcrescimoItem(item: ItemTransacaoComercial): number {
  const itemComParciais = item as ItemTransacaoComValoresParciais;

  return itemComParciais.valorAcrescimo ?? 0;
}

function getValorTotalItem(item: ItemTransacaoComercial): number {
  return getValorSubtotalItem(item) - item.valorDesconto + getValorAcrescimoItem(item);
}

function mapTransacao(row: TransacaoRow): TransacaoComercial {
  const valorSubtotal = numberFromDecimal(row.valor_subtotal, 0);
  const valorDesconto = numberFromDecimal(row.valor_desconto, 0);
  const valorAcrescimo = numberFromDecimal(row.valor_acrescimo, 0);
  const valorTotal = numberFromDecimal(
    row.valor_total,
    valorSubtotal - valorDesconto + valorAcrescimo,
  );

  return {
    transacaoId: row.transacao_id as TransacaoId,
    locatarioId: row.locatario_id as LocatarioId,
    tipo: mapTipoTransacao(row.tipo),
    clienteId: row.cliente_id,
    fornecedorId: row.fornecedor_id,
    status: mapStatusTransacaoParaDominio(row.status),

    valorSubtotal,
    valorDesconto,
    valorAcrescimo,
    valorTotal,

    observacao: row.observacao ?? null,

    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,

    canceladoEm: row.cancelado_em ?? null,
    canceladoPor: row.cancelado_por as UsuarioId | null,
    canceladoMotivo: row.cancelado_motivo ?? null,

    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  };
}

function mapItem(row: ItemTransacaoRow): ItemTransacaoComercial {
  const tipoProduto = mapTipoProduto(row.tipo_produto ?? row.produtos?.tipo ?? "PRODUTO");

  const quantidade = numberFromDecimal(row.quantidade, 1);
  const valorUnitario = numberFromDecimal(row.valor_unitario, 0);
  const valorSubtotal = numberFromDecimal(row.valor_subtotal, quantidade * valorUnitario);
  const valorDesconto = numberFromDecimal(row.valor_desconto, 0);
  const valorAcrescimo = numberFromDecimal(row.valor_acrescimo, 0);
  const valorTotal = numberFromDecimal(
    row.valor_total,
    valorSubtotal - valorDesconto + valorAcrescimo,
  );

  return {
    itemTransacaoId: row.item_transacao_id as ItemTransacaoId,
    transacaoId: row.transacao_id as TransacaoId,
    locatarioId: row.locatario_id as LocatarioId,

    produtoId: row.produto_id as ProdutoId,
    estoqueId: row.estoque_id as EstoqueId | null,

    descricao: row.descricao ?? row.produtos?.nome ?? "Item",
    tipoProduto,

    quantidade,
    valorUnitario,
    valorSubtotal,
    valorDesconto,
    valorAcrescimo,
    valorTotal,

    movimentaEstoque: row.movimenta_estoque ?? tipoProduto === "PRODUTO",

    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,

    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  } as ItemTransacaoComercial;
}

/**
 * Repositório Prisma de transações comerciais.
 *
 * Observações:
 * - os campos parciais novos são a fonte principal de leitura e escrita;
 * - histórico comercial ainda permanece em memória enquanto a tabela
 *   definitiva não for criada.
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
            origem: "AVULSA",

            valor_subtotal: transacao.valorSubtotal,
            valor_desconto: transacao.valorDesconto,
            valor_acrescimo: transacao.valorAcrescimo,
            valor_total: transacao.valorTotal,

            observacao: normalizarTextoOpcional(transacao.observacao),
            vencimento_em: transacao.criadoEm,
            status: mapStatusTransacaoParaDb(transacao.status),

            criado_em: transacao.criadoEm,
            atualizado_em: transacao.atualizadoEm,

            cancelado_em: transacao.canceladoEm,
            cancelado_por: transacao.canceladoPor,
            cancelado_motivo: normalizarTextoOpcional(transacao.canceladoMotivo),

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
            ...(params.status ? { status: mapStatusTransacaoParaDb(params.status) } : {}),
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

            valor_subtotal: transacao.valorSubtotal,
            valor_desconto: transacao.valorDesconto,
            valor_acrescimo: transacao.valorAcrescimo,
            valor_total: transacao.valorTotal,

            observacao: normalizarTextoOpcional(transacao.observacao),
            status: mapStatusTransacaoParaDb(transacao.status),

            atualizado_em: transacao.atualizadoEm,

            cancelado_em: transacao.canceladoEm,
            cancelado_por: transacao.canceladoPor,
            cancelado_motivo: normalizarTextoOpcional(transacao.canceladoMotivo),

            excluido_em: transacao.excluidoEm,
            excluido_por: transacao.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(transacao.excluidoMotivo),
          },
        });

        return wrapOk({
          ...transacao,
          observacao: normalizarTextoOpcional(transacao.observacao),
          canceladoMotivo: normalizarTextoOpcional(transacao.canceladoMotivo),
          excluidoMotivo: normalizarTextoOpcional(transacao.excluidoMotivo),
        });
      } catch (causa) {
        console.error("[vendasRepositorioPrisma.atualizarTransacao] transacao recebida:", transacao);
        console.error("[vendasRepositorioPrisma.atualizarTransacao] causa real:", causa);

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
        if (item.movimentaEstoque && !item.estoqueId) {
          return mapearErroInfra(
            new Error("estoqueId é obrigatório para item que movimenta estoque."),
            {
              entidade: "itens_transacao",
              operacao: "vendas.adicionarItem",
              detalhes: {
                locatarioId: item.locatarioId,
                transacaoId: item.transacaoId,
                itemTransacaoId: item.itemTransacaoId,
                produtoId: item.produtoId,
                motivo: "estoque_id_obrigatorio_para_item_que_movimenta_estoque",
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

            descricao: normalizarTextoOpcional(item.descricao),
            tipo_produto: item.tipoProduto,
            quantidade: item.quantidade,
            valor_unitario: item.valorUnitario,
            valor_subtotal: getValorSubtotalItem(item),
            valor_desconto: item.valorDesconto,
            valor_acrescimo: getValorAcrescimoItem(item),
            valor_total: item.valorTotal,
            movimenta_estoque: item.movimentaEstoque,

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
        if (item.movimentaEstoque && !item.estoqueId) {
          return mapearErroInfra(
            new Error("estoqueId é obrigatório para atualizar item que movimenta estoque."),
            {
              entidade: "itens_transacao",
              operacao: "vendas.atualizarItem",
              detalhes: {
                locatarioId: item.locatarioId,
                transacaoId: item.transacaoId,
                itemTransacaoId: item.itemTransacaoId,
                produtoId: item.produtoId,
                motivo: "estoque_id_obrigatorio_para_item_que_movimenta_estoque",
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

            descricao: normalizarTextoOpcional(item.descricao),
            tipo_produto: item.tipoProduto,
            quantidade: item.quantidade,
            valor_unitario: item.valorUnitario,
            valor_subtotal: getValorSubtotalItem(item),
            valor_desconto: item.valorDesconto,
            valor_acrescimo: getValorAcrescimoItem(item),
            valor_total: item.valorTotal,
            movimenta_estoque: item.movimentaEstoque,

            atualizado_em: item.atualizadoEm,

            excluido_em: item.excluidoEm,
            excluido_por: item.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(item.excluidoMotivo),
          },
        });

        return wrapOk({
          ...item,
          descricao: normalizarTextoOpcional(item.descricao) ?? item.descricao,
          excluidoMotivo: normalizarTextoOpcional(item.excluidoMotivo),
        } as ItemTransacaoComercial);
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

    async listarItensPorTransacao(params): Promise<Result<ItemTransacaoComercial[], ErroApp>> {
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
          operacao: "infra.vendas.listarItensPorTransacao",
          detalhes: params,
        });
      }
    },

    async removerItem(params): Promise<Result<void, ErroApp>> {
      try {
        await db.itens_transacao.update({
          where: {
            locatario_id_transacao_id_item_transacao_id: {
              locatario_id: params.locatarioId,
              transacao_id: params.transacaoId,
              item_transacao_id: params.itemTransacaoId,
            },
          },
          data: {
            excluido_em: new Date(),
            excluido_por: null,
            excluido_motivo: "Item removido da transação.",
            atualizado_em: new Date(),
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "itens_transacao",
          operacao: "infra.vendas.removerItem",
          detalhes: params,
        });
      }
    },

    async registrarMovimentoEstoque(movimento: MovimentoEstoqueComercial) {
      return createMovimentacaoEstoquePortaPrisma(db).registrarMovimento(movimento);
    },
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
    async buscarProdutoParaTransacao(params): Promise<
      Result<
        {
          produtoId: ProdutoId;
          nome: string;
          tipo: "PRODUTO" | "SERVICO";
          status: "ATIVO" | "INATIVO" | "EXCLUIDO";
          precoVenda: number;
          precoVarejo: number;
          precoAtacado: number | null;
          quantidadeMinimaAtacado: number | null;
          custoReferencia: number | null;
        },
        ErroApp
      >
    > {
      try {
        const row: ProdutoConsultaRow | null = await db.produtos.findFirst({
          where: {
            produto_id: params.produtoId,
            locatario_id: params.locatarioId,
          },
          select: produtoConsultaSelect,
        });

        if (!row) {
          return wrapOk({
            produtoId: params.produtoId,
            nome: "Produto não encontrado",
            tipo: "PRODUTO",
            status: "EXCLUIDO",
            precoVenda: 0,
            precoVarejo: 0,
            precoAtacado: null,
            quantidadeMinimaAtacado: null,
            custoReferencia: null,
          });
        }

        const precoVarejo = numberFromDecimal(row.preco_varejo);

        return wrapOk({
          produtoId: row.produto_id as ProdutoId,
          nome: row.nome,
          tipo: mapTipoProduto(row.tipo),
          status: row.excluido_em ? "EXCLUIDO" : row.ativo ? "ATIVO" : "INATIVO",
          precoVenda: precoVarejo,
          precoVarejo,
          precoAtacado: row.preco_atacado === null ? null : numberFromDecimal(row.preco_atacado),
          quantidadeMinimaAtacado: row.quantidade_minima_atacado === null ? null : numberFromDecimal(row.quantidade_minima_atacado),
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
        const delta =
          movimento.tipo === "SAIDA"
            ? -Math.abs(movimento.quantidade)
            : Math.abs(movimento.quantidade);

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
            detalhes: {
              origem: "TRANSACAO_COMERCIAL",
              transacaoId: movimento.transacaoId,
              itemTransacaoId: movimento.itemTransacaoId,
              produtoId: movimento.produtoId,
              estoqueId: movimento.estoqueId,
              tipoMovimento: movimento.tipo,
              quantidade: Math.abs(movimento.quantidade),
              delta,
            },
            referencia: `${movimento.transacaoId}:${movimento.itemTransacaoId}`,
            observacao:
              movimento.tipo === "ENTRADA"
                ? "Entrada gerada por confirmação de compra."
                : "Saída gerada por confirmação de venda.",
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
