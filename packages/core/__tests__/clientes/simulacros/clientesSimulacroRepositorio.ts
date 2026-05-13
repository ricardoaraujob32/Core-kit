// packages/core/__tests__/clientes/simulacros/clientesSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { ClientesRepositorio } from "../../../src/clientes/portasRepositorio";
import type { Cliente } from "../../../src/clientes/tipos";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type OperacaoClientes =
  | "criar"
  | "buscarPorId"
  | "listarPorLocatario"
  | "atualizar";

export type ClientesSimulacroRepositorio = ClientesRepositorio & {
  carregar(cliente: Cliente): void;
  carregarMuitos(clientes: Cliente[]): void;
  dump(): Cliente[];
  limpar(): void;
  simularFalha(operacao: OperacaoClientes, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function clonarCliente(cliente: Cliente): Cliente {
  return {
    ...cliente,
    criadoEm: new Date(cliente.criadoEm),
    atualizadoEm: new Date(cliente.atualizadoEm),
    excluidoEm: cliente.excluidoEm ? new Date(cliente.excluidoEm) : null,
  };
}

export function criarClientesSimulacroRepositorio(
  inicial: Cliente[] = [],
): ClientesSimulacroRepositorio {
  const itens = new Map<string, Cliente>();

  const falhas = criarControleFalhasRepositorio<OperacaoClientes>({
    namespace: "teste.clientes",
    mensagemPadrao: "Falha simulada no repositório de clientes.",
  });

  const api: ClientesSimulacroRepositorio = {
    carregar(cliente) {
      itens.set(cliente.clienteId, clonarCliente(cliente));
    },

    carregarMuitos(clientes) {
      for (const cliente of clientes) api.carregar(cliente);
    },

    dump() {
      return [...itens.values()].map(clonarCliente);
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

    async criar(cliente: Parameters<ClientesRepositorio["criar"]>[0]) {
      if (falhas.possuiFalha("criar")) return wrapErr(falhas.erroFalha("criar"));
      api.carregar(cliente as Cliente);
      return wrapOk({ clienteId: cliente.clienteId });
    },

    async buscarPorId(params: Parameters<ClientesRepositorio["buscarPorId"]>[0]) {
      if (falhas.possuiFalha("buscarPorId")) return wrapErr(falhas.erroFalha("buscarPorId"));

      const item = itens.get(params.clienteId);

      return wrapOk(
        item && item.locatarioId === params.locatarioId && !item.excluidoEm
          ? clonarCliente(item)
          : null,
      );
    },

    async listarPorLocatario(params: Parameters<ClientesRepositorio["listarPorLocatario"]>[0]) {
      if (falhas.possuiFalha("listarPorLocatario")) {
        return wrapErr(falhas.erroFalha("listarPorLocatario"));
      }

      const todos = [...itens.values()]
        .filter((item) => item.locatarioId === params.locatarioId && !item.excluidoEm)
        .map(clonarCliente)
        .sort((a, b) => a.clienteId.localeCompare(b.clienteId));

      const start = params.cursor
        ? Math.max(0, todos.findIndex((item) => item.clienteId === params.cursor) + 1)
        : 0;

      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },

    async atualizar(cliente: Parameters<ClientesRepositorio["atualizar"]>[0]) {
      if (falhas.possuiFalha("atualizar")) return wrapErr(falhas.erroFalha("atualizar"));
      api.carregar(cliente as Cliente);
      return wrapOk(clonarCliente(cliente as Cliente));
    },
  };

  api.carregarMuitos(inicial);

  return api;
}

export function criarClienteTeste(params: Partial<Cliente> = {}): Cliente {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");

  return {
    clienteId: params.clienteId ?? "cli-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    nome: params.nome ?? "Cliente Teste",
    documento: params.documento ?? null,
    email: params.email ?? "cliente@example.com",
    telefone: params.telefone ?? null,
    status: params.status ?? "ATIVO",
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    excluidoEm: params.excluidoEm ?? null,
    excluidoPor: params.excluidoPor ?? null,
    excluidoMotivo: params.excluidoMotivo ?? null,
  } as Cliente;
}