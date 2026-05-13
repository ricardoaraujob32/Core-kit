// packages/core/__tests__/produtos/simulacros/produtosSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { ProdutosRepositorio } from "../../../src/produtos/portasRepositorio";
import type { Produto } from "../../../src/produtos/tipos";
import { criarControleFalhasRepositorio, type FalhaSimuladaRepositorio } from "../../simulacroRepositorioFactory";

type OperacaoProdutos = "criar" | "buscarPorId" | "listarPorLocatario" | "atualizar";

export type ProdutosSimulacroRepositorio = ProdutosRepositorio & {
  carregar(produto: Produto): void;
  carregarMuitos(produtos: Produto[]): void;
  dump(): Produto[];
  limpar(): void;
  simularFalha(operacao: OperacaoProdutos, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
};

function clonarProduto(produto: Produto): Produto {
  return {
    ...produto,
    criadoEm: new Date(produto.criadoEm),
    atualizadoEm: new Date(produto.atualizadoEm),
    excluidoEm: produto.excluidoEm ? new Date(produto.excluidoEm) : null,
  };
}

export function criarProdutosSimulacroRepositorio(
  inicial: Produto[] = [],
): ProdutosSimulacroRepositorio {
  const itens = new Map<string, Produto>();
  const falhas = criarControleFalhasRepositorio<OperacaoProdutos>({
    namespace: "teste.produtos",
    mensagemPadrao: "Falha simulada no repositório de produtos.",
  });

  const api: ProdutosSimulacroRepositorio = {
    carregar(produto) {
      itens.set(produto.produtoId, clonarProduto(produto));
    },
    carregarMuitos(produtos) {
      for (const produto of produtos) api.carregar(produto);
    },
    dump() {
      return [...itens.values()].map(clonarProduto);
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
    async criar(produto: Parameters<ProdutosRepositorio["criar"]>[0]) {
      if (falhas.possuiFalha("criar")) return wrapErr(falhas.erroFalha("criar"));
      api.carregar(produto as Produto);
      return wrapOk({ produtoId: produto.produtoId });
    },
    async buscarPorId(params: Parameters<ProdutosRepositorio["buscarPorId"]>[0]) {
      if (falhas.possuiFalha("buscarPorId")) return wrapErr(falhas.erroFalha("buscarPorId"));
      const item = itens.get(params.produtoId);
      return wrapOk(
        item && item.locatarioId === params.locatarioId && !item.excluidoEm
          ? clonarProduto(item)
          : null,
      );
    },
    async listarPorLocatario(params: Parameters<ProdutosRepositorio["listarPorLocatario"]>[0]) {
      if (falhas.possuiFalha("listarPorLocatario")) return wrapErr(falhas.erroFalha("listarPorLocatario"));
      const todos = [...itens.values()]
        .filter(
          (item) =>
            item.locatarioId === params.locatarioId &&
            !item.excluidoEm &&
            (!params.tipo || item.tipo === params.tipo),
        )
        .map(clonarProduto)
        .sort((a, b) => a.produtoId.localeCompare(b.produtoId));
      const start = params.cursor
        ? Math.max(0, todos.findIndex((item) => item.produtoId === params.cursor) + 1)
        : 0;
      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },
    async atualizar(produto: Parameters<ProdutosRepositorio["atualizar"]>[0]) {
      if (falhas.possuiFalha("atualizar")) return wrapErr(falhas.erroFalha("atualizar"));
      api.carregar(produto as Produto);
      return wrapOk(clonarProduto(produto as Produto));
    },
  };

  api.carregarMuitos(inicial);
  return api;
}

export function criarProdutoTeste(params: Partial<Produto> = {}): Produto {
  const criadoEm = params.criadoEm ?? new Date("2026-01-01T00:00:00.000Z");
  return {
    produtoId: params.produtoId ?? "prod-teste-1",
    locatarioId: params.locatarioId ?? "loc-teste-1",
    sku: params.sku ?? null,
    nome: params.nome ?? "Produto Teste",
    descricao: params.descricao ?? null,
    unidade: params.unidade ?? "UN",
    tipo: params.tipo ?? "PRODUTO",
    status: params.status ?? "ATIVO",
    precoVenda: params.precoVenda ?? 10,
    custoReferencia: params.custoReferencia ?? null,
    criadoEm,
    atualizadoEm: params.atualizadoEm ?? criadoEm,
    excluidoEm: params.excluidoEm ?? null,
    excluidoPor: params.excluidoPor ?? null,
    excluidoMotivo: params.excluidoMotivo ?? null,
  } as Produto;
}