// packages/core/__tests__/fornecedores/simulacros/fornecedoresSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { FornecedoresRepositorio } from "../../../src/fornecedores/portasRepositorio";
import type { Fornecedor } from "../../../src/fornecedores/tipos";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type OperacaoFornecedors =
  | "criar"
  | "buscarPorId"
  | "listarPorLocatario"
  | "atualizar";

export type FornecedoresSimulacroRepositorio = FornecedoresRepositorio & {
  carregar(fornecedor: Fornecedor): void;
  carregarMuitos(fornecedors: Fornecedor[]): void;
  dump(): Fornecedor[];
  limpar(): void;
  simularFalha(operacao: OperacaoFornecedors, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function clonarFornecedor(fornecedor: Fornecedor): Fornecedor {
  return {
    ...fornecedor,
    criadoEm: new Date(fornecedor.criadoEm),
    atualizadoEm: new Date(fornecedor.atualizadoEm),
    excluidoEm: fornecedor.excluidoEm ? new Date(fornecedor.excluidoEm) : null,
  };
}

export function criarFornecedoresSimulacroRepositorio(
  inicial: Fornecedor[] = [],
): FornecedoresSimulacroRepositorio {
  const itens = new Map<string, Fornecedor>();

  const falhas = criarControleFalhasRepositorio<OperacaoFornecedors>({
    namespace: "teste.fornecedores",
    mensagemPadrao: "Falha simulada no repositório de fornecedores.",
  });

  const api: FornecedoresSimulacroRepositorio = {
    carregar(fornecedor) {
      itens.set(fornecedor.fornecedorId, clonarFornecedor(fornecedor));
    },

    carregarMuitos(fornecedors) {
      for (const fornecedor of fornecedors) api.carregar(fornecedor);
    },

    dump() {
      return [...itens.values()].map(clonarFornecedor);
    },

    limpar() {
      itens.clear();
      falhas.limparFalhas();
    },

    simularFalha(operacao, falha) {
      falhas.simularFalha(operacao, falha);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

    async criar(fornecedor: Parameters<FornecedoresRepositorio["criar"]>[0]) {
      if (falhas.possuiFalha("criar")) return wrapErr(falhas.erroFalha("criar"));
      api.carregar(fornecedor as Fornecedor);
      return wrapOk({ fornecedorId: fornecedor.fornecedorId });
    },

    async buscarPorId(params: Parameters<FornecedoresRepositorio["buscarPorId"]>[0]) {
      if (falhas.possuiFalha("buscarPorId")) return wrapErr(falhas.erroFalha("buscarPorId"));

      const item = itens.get(params.fornecedorId);

      return wrapOk(
        item && item.locatarioId === params.locatarioId && !item.excluidoEm
          ? clonarFornecedor(item)
          : null,
      );
    },

    async listarPorLocatario(params: Parameters<FornecedoresRepositorio["listarPorLocatario"]>[0]) {
      if (falhas.possuiFalha("listarPorLocatario")) {
        return wrapErr(falhas.erroFalha("listarPorLocatario"));
      }

      const todos = [...itens.values()]
        .filter((item) => item.locatarioId === params.locatarioId && !item.excluidoEm)
        .map(clonarFornecedor)
        .sort((a, b) => a.fornecedorId.localeCompare(b.fornecedorId));

      const start = params.cursor
        ? Math.max(0, todos.findIndex((item) => item.fornecedorId === params.cursor) + 1)
        : 0;

      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },

    async atualizar(fornecedor: Parameters<FornecedoresRepositorio["atualizar"]>[0]) {
      if (falhas.possuiFalha("atualizar")) return wrapErr(falhas.erroFalha("atualizar"));
      api.carregar(fornecedor as Fornecedor);
      return wrapOk(clonarFornecedor(fornecedor as Fornecedor));
    },
  };

  api.carregarMuitos(inicial);

  return api;
}

export function criarFornecedorTeste(params: Partial<Fornecedor> = {}): Fornecedor {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");

  return {
    fornecedorId: params.fornecedorId ?? "for-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    nome: params.nome ?? "Fornecedor Teste",
    documento: params.documento ?? null,
    email: params.email ?? "fornecedor@example.com",
    telefone: params.telefone ?? null,
    status: params.status ?? "ATIVO",
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    excluidoEm: params.excluidoEm ?? null,
    excluidoPor: params.excluidoPor ?? null,
    excluidoMotivo: params.excluidoMotivo ?? null,
  } as Fornecedor;
}