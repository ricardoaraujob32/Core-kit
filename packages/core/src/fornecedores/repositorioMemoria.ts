import { wrapOk } from "../kernel";
import type { FornecedoresRepositorio } from "./portasRepositorio";
import type { Fornecedor } from "./tipos";

export function createFornecedorsRepositorioMemoria(seed: Fornecedor[] = []): FornecedoresRepositorio {
  const itens = new Map<string, Fornecedor>();
  for (const item of seed) itens.set(item.fornecedorId, item);
  return {
    async criar(fornecedor) { itens.set(fornecedor.fornecedorId, fornecedor); return wrapOk({ fornecedorId: fornecedor.fornecedorId }); },
    async buscarPorId(params) {
      const item = itens.get(params.fornecedorId);
      return wrapOk(item && item.locatarioId === params.locatarioId && !item.excluidoEm ? item : null);
    },
    async listarPorLocatario(params) {
      const todos = [...itens.values()].filter((i) => i.locatarioId === params.locatarioId && !i.excluidoEm).sort((a,b) => a.fornecedorId.localeCompare(b.fornecedorId));
      const start = params.cursor ? Math.max(0, todos.findIndex((i) => i.fornecedorId === params.cursor) + 1) : 0;
      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },
    async atualizar(fornecedor) { itens.set(fornecedor.fornecedorId, fornecedor); return wrapOk(fornecedor); },
  };
}
