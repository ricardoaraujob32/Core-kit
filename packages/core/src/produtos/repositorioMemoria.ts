import { wrapOk } from "../kernel";
import type { ProdutosRepositorio } from "./portasRepositorio";
import type { Produto } from "./tipos";

export function createProdutosRepositorioMemoria(seed: Produto[] = []): ProdutosRepositorio {
  const itens = new Map<string, Produto>();
  for (const item of seed) itens.set(item.produtoId, item);
  return {
    async criar(produto) { itens.set(produto.produtoId, produto); return wrapOk({ produtoId: produto.produtoId }); },
    async buscarPorId(params) {
      const item = itens.get(params.produtoId);
      return wrapOk(item && item.locatarioId === params.locatarioId && !item.excluidoEm ? item : null);
    },
    async listarPorLocatario(params) {
      const todos = [...itens.values()].filter((item) => item.locatarioId === params.locatarioId && !item.excluidoEm && (!params.tipo || item.tipo === params.tipo)).sort((a, b) => a.produtoId.localeCompare(b.produtoId));
      const start = params.cursor ? Math.max(0, todos.findIndex((i) => i.produtoId === params.cursor) + 1) : 0;
      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },
    async atualizar(produto) { itens.set(produto.produtoId, produto); return wrapOk(produto); },
  };
}
