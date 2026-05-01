import { wrapOk } from "../kernel";
import type { ClientesRepositorio } from "./portasRepositorio";
import type { Cliente } from "./tipos";

export function createClientesRepositorioMemoria(seed: Cliente[] = []): ClientesRepositorio {
  const itens = new Map<string, Cliente>();
  for (const item of seed) itens.set(item.clienteId, item);
  return {
    async criar(cliente) { itens.set(cliente.clienteId, cliente); return wrapOk({ clienteId: cliente.clienteId }); },
    async buscarPorId(params) {
      const item = itens.get(params.clienteId);
      return wrapOk(item && item.locatarioId === params.locatarioId && !item.excluidoEm ? item : null);
    },
    async listarPorLocatario(params) {
      const todos = [...itens.values()].filter((i) => i.locatarioId === params.locatarioId && !i.excluidoEm).sort((a,b) => a.clienteId.localeCompare(b.clienteId));
      const start = params.cursor ? Math.max(0, todos.findIndex((i) => i.clienteId === params.cursor) + 1) : 0;
      return wrapOk(todos.slice(start, params.limite ? start + params.limite : undefined));
    },
    async atualizar(cliente) { itens.set(cliente.clienteId, cliente); return wrapOk(cliente); },
  };
}
