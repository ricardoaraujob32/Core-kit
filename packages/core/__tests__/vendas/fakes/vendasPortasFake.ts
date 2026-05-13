// packages/core/__tests__/vendas/fakes/vendasPortasFake.ts

import { createErroApp, wrapOk } from "../../../src/kernel";
import type {
  EstoquePadraoConsultaPorta,
  MovimentacaoEstoquePorta,
  ProdutoComercialConsultaPorta,
} from "../../../src/vendas/portasRepositorio";

export function criarProdutosConsultaFake(params: {
  produto?: {
    produtoId: string;
    nome: string;
    tipo: "PRODUTO" | "SERVICO";
    status: "ATIVO" | "INATIVO";
    precoVenda: number;
  };
  falhar?: boolean;
} = {}): ProdutoComercialConsultaPorta {
  return {
    async buscarProdutoParaTransacao() {
      if (params.falhar) return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "Falha produto.", detalhes: { simulada: true } });
      return wrapOk(params.produto ?? { produtoId: "prod-1", nome: "Produto Teste", tipo: "PRODUTO", status: "ATIVO", precoVenda: 10 });
    },
  } as ProdutoComercialConsultaPorta;
}

export function criarEstoquePadraoConsultaFake(params: {
  estoqueId?: string | null;
  falhar?: boolean;
} = {}): EstoquePadraoConsultaPorta {
  return {
    async obterEstoquePadrao() {
      if (params.falhar) return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "Falha estoque.", detalhes: { simulada: true } });
      return wrapOk(params.estoqueId === null ? null : { estoqueId: params.estoqueId ?? "est-1" });
    },
  } as EstoquePadraoConsultaPorta;
}

export function criarMovimentacaoEstoqueFake(params: { falhar?: boolean } = {}): MovimentacaoEstoquePorta & {
  movimentos(): unknown[];
} {
  const movimentos: unknown[] = [];
  return {
    movimentos() { return [...movimentos]; },
    async registrarMovimento(input) {
      if (params.falhar) return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "Falha movimento.", detalhes: { simulada: true } });
      movimentos.push(input);
      return wrapOk(undefined);
    },
  } as MovimentacaoEstoquePorta & { movimentos(): unknown[] };
}
