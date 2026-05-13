// packages/core/__tests__/vendas/simulacros/vendasSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { VendasRepositorio } from "../../../src/vendas/portasRepositorio";
import type { HistoricoTransacaoComercial, ItemTransacaoComercial, TransacaoComercial } from "../../../src/vendas/tipos";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type OperacaoVendas =
  | "criarTransacao"
  | "buscarTransacaoPorId"
  | "listarTransacoes"
  | "atualizarTransacao"
  | "criarItem"
  | "buscarItemPorId"
  | "listarItens"
  | "listarItensPorTransacao"
  | "atualizarItem"
  | "removerItem"
  | "criarHistorico"
  | "listarHistorico";

export type VendasSimulacroRepositorio = VendasRepositorio & {
  carregarTransacao(transacao: TransacaoComercial): void;
  carregarItem(item: ItemTransacaoComercial): void;
  carregarHistorico(historico: HistoricoTransacaoComercial): void;
  dump(): {
    transacoes: TransacaoComercial[];
    itens: ItemTransacaoComercial[];
    historico: HistoricoTransacaoComercial[];
  };
  simularFalha(operacao: OperacaoVendas, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function cloneDate<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, v instanceof Date ? new Date(v) : v]),
  ) as T;
}

export function criarVendasSimulacroRepositorio(params: {
  transacoes?: TransacaoComercial[];
  itens?: ItemTransacaoComercial[];
  historico?: HistoricoTransacaoComercial[];
} = {}): VendasSimulacroRepositorio {
  const transacoes = new Map<string, TransacaoComercial>();
  const itens = new Map<string, ItemTransacaoComercial>();
  const historicos = new Map<string, HistoricoTransacaoComercial>();

  const falhas = criarControleFalhasRepositorio<OperacaoVendas>({
    namespace: "teste.vendas",
    mensagemPadrao: "Falha simulada no repositório de vendas.",
  });

  const api: VendasSimulacroRepositorio = {
    carregarTransacao(transacao) {
      transacoes.set(transacao.transacaoId, cloneDate(transacao));
    },

    carregarItem(item) {
      itens.set(item.itemTransacaoId, cloneDate(item));
    },

    carregarHistorico(historico) {
      historicos.set(historico.historicoId, cloneDate(historico));
    },

    dump() {
      return {
        transacoes: [...transacoes.values()].map(cloneDate),
        itens: [...itens.values()].map(cloneDate),
        historico: [...historicos.values()].map(cloneDate),
      };
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async criarTransacao(t) {
      if (falhas.possuiFalha("criarTransacao")) return wrapErr(falhas.erroFalha("criarTransacao"));
      api.carregarTransacao(t as TransacaoComercial);
      return wrapOk({ transacaoId: t.transacaoId });
    },

    async buscarTransacaoPorId(p) {
      if (falhas.possuiFalha("buscarTransacaoPorId")) return wrapErr(falhas.erroFalha("buscarTransacaoPorId"));
      const t = transacoes.get(p.transacaoId);
      return wrapOk(t && t.locatarioId === p.locatarioId && !t.excluidoEm ? cloneDate(t) : null);
    },

    async listarTransacoes(p) {
      if (falhas.possuiFalha("listarTransacoes")) return wrapErr(falhas.erroFalha("listarTransacoes"));
      const todos = [...transacoes.values()]
        .filter(
          (t) =>
            t.locatarioId === p.locatarioId &&
            !t.excluidoEm &&
            (!p.tipo || t.tipo === p.tipo) &&
            (!p.status || t.status === p.status),
        )
        .map(cloneDate)
        .sort((a, b) => a.transacaoId.localeCompare(b.transacaoId));
      const start = p.cursor ? Math.max(0, todos.findIndex((i) => i.transacaoId === p.cursor) + 1) : 0;
      return wrapOk(todos.slice(start, p.limite ? start + p.limite : undefined));
    },

    async atualizarTransacao(t) {
      if (falhas.possuiFalha("atualizarTransacao")) return wrapErr(falhas.erroFalha("atualizarTransacao"));
      api.carregarTransacao(t as TransacaoComercial);
      return wrapOk(cloneDate(t as TransacaoComercial));
    },

    async criarItem(i) {
      if (falhas.possuiFalha("criarItem")) return wrapErr(falhas.erroFalha("criarItem"));
      api.carregarItem(i as ItemTransacaoComercial);
      return wrapOk({ itemTransacaoId: i.itemTransacaoId });
    },

    async buscarItemPorId(p) {
      if (falhas.possuiFalha("buscarItemPorId")) return wrapErr(falhas.erroFalha("buscarItemPorId"));
      const i = itens.get(p.itemTransacaoId);
      return wrapOk(
        i && i.locatarioId === p.locatarioId && i.transacaoId === p.transacaoId && !i.excluidoEm
          ? cloneDate(i)
          : null,
      );
    },

    async listarItens(p) {
      if (falhas.possuiFalha("listarItens")) return wrapErr(falhas.erroFalha("listarItens"));
      return wrapOk(
        [...itens.values()]
          .filter((i) => i.locatarioId === p.locatarioId && i.transacaoId === p.transacaoId && !i.excluidoEm)
          .map(cloneDate),
      );
    },

    async listarItensPorTransacao(p) {
      if (falhas.possuiFalha("listarItensPorTransacao")) {
        return wrapErr(falhas.erroFalha("listarItensPorTransacao"));
      }
      return api.listarItens(p);
    },

    async atualizarItem(i) {
      if (falhas.possuiFalha("atualizarItem")) return wrapErr(falhas.erroFalha("atualizarItem"));
      api.carregarItem(i as ItemTransacaoComercial);
      return wrapOk(cloneDate(i as ItemTransacaoComercial));
    },

    async removerItem(p) {
      if (falhas.possuiFalha("removerItem")) return wrapErr(falhas.erroFalha("removerItem"));
      const item = itens.get(p.itemTransacaoId);
      if (item) {
        itens.set(p.itemTransacaoId, cloneDate({ ...item, excluidoEm: new Date("2026-03-12T10:00:00.000Z") }));
      }
      return wrapOk(undefined);
    },

    async criarHistorico(h) {
      if (falhas.possuiFalha("criarHistorico")) return wrapErr(falhas.erroFalha("criarHistorico"));
      api.carregarHistorico(h as HistoricoTransacaoComercial);
      return wrapOk({ historicoId: h.historicoId });
    },

    async listarHistorico(p) {
      if (falhas.possuiFalha("listarHistorico")) return wrapErr(falhas.erroFalha("listarHistorico"));
      return wrapOk(
        [...historicos.values()]
          .filter((h) => h.locatarioId === p.locatarioId && h.transacaoId === p.transacaoId)
          .map(cloneDate)
          .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime()),
      );
    },
  } as VendasSimulacroRepositorio;

  for (const t of params.transacoes ?? []) api.carregarTransacao(t);
  for (const i of params.itens ?? []) api.carregarItem(i);
  for (const h of params.historico ?? []) api.carregarHistorico(h);

  return api;
}

export function criarTransacaoTeste(params: Partial<TransacaoComercial> = {}): TransacaoComercial {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");
  return {
    transacaoId: params.transacaoId ?? "trx-1",
    locatarioId: params.locatarioId ?? "loc-1",
    tipo: params.tipo ?? "VENDA",
    clienteId: params.clienteId ?? null,
    fornecedorId: params.fornecedorId ?? null,
    status: params.status ?? "RASCUNHO",
    valorSubtotal: params.valorSubtotal ?? 0,
    valorDesconto: params.valorDesconto ?? 0,
    valorAcrescimo: params.valorAcrescimo ?? 0,
    valorTotal: params.valorTotal ?? 0,
    observacao: params.observacao ?? null,
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    canceladoEm: params.canceladoEm ?? null,
    canceladoPor: params.canceladoPor ?? null,
    canceladoMotivo: params.canceladoMotivo ?? null,
    excluidoEm: params.excluidoEm ?? null,
    excluidoPor: params.excluidoPor ?? null,
    excluidoMotivo: params.excluidoMotivo ?? null,
  } as TransacaoComercial;
}

export function criarItemTransacaoTeste(params: Partial<ItemTransacaoComercial> = {}): ItemTransacaoComercial {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");
  return {
    itemTransacaoId: params.itemTransacaoId ?? "item-1",
    transacaoId: params.transacaoId ?? "trx-1",
    locatarioId: params.locatarioId ?? "loc-1",
    produtoId: params.produtoId ?? "prod-1",
    estoqueId: params.estoqueId ?? "est-1",
    descricao: params.descricao ?? "Produto Teste",
    tipoProduto: params.tipoProduto ?? "PRODUTO",
    quantidade: params.quantidade ?? 2,
    valorUnitario: params.valorUnitario ?? 10,
    valorDesconto: params.valorDesconto ?? 0,
    valorTotal: params.valorTotal ?? 20,
    movimentaEstoque: params.movimentaEstoque ?? true,
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    excluidoEm: params.excluidoEm ?? null,
    excluidoPor: params.excluidoPor ?? null,
    excluidoMotivo: params.excluidoMotivo ?? null,
  } as ItemTransacaoComercial;
}

export function criarHistoricoTeste(params: Partial<HistoricoTransacaoComercial> = {}): HistoricoTransacaoComercial {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");
  return {
    historicoId: params.historicoId ?? "hist-1",
    transacaoId: params.transacaoId ?? "trx-1",
    locatarioId: params.locatarioId ?? "loc-1",
    evento: params.evento ?? "TESTE",
    resumo: params.resumo ?? "Evento de teste",
    criadoPor: params.criadoPor ?? null,
    statusAnterior: params.statusAnterior ?? null,
    statusNovo: params.statusNovo ?? null,
    detalhes: params.detalhes ?? {},
    criadoEm,
  } as HistoricoTransacaoComercial;
}