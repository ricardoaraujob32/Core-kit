import { wrapOk } from "../../kernel/index.js";
import type { VendasRepositorio } from "../portasRepositorio.js";
import type { ListarTransacoesInput, ListarTransacoesOutput, ListarTransacoesResult } from "../tipos.js";
import { validarLocatarioId, validarStatusTransacao, validarTipoTransacao } from "../validadores.js";

export function createFnListarTransacoes(deps: { vendasRepositorio: VendasRepositorio }) {
  return async function listarTransacoes(input: ListarTransacoesInput): ListarTransacoesResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    if (input.tipo !== undefined) { const tipo = validarTipoTransacao(input.tipo); if (!tipo.ok) return tipo; }
    if (input.status !== undefined) { const status = validarStatusTransacao(input.status); if (!status.ok) return status; }
    const res = await deps.vendasRepositorio.listarTransacoes({ locatarioId: locatarioId.value, tipo: input.tipo, status: input.status, cursor: input.cursor, limite: input.limite });
    if (!res.ok) return res;
    return wrapOk<ListarTransacoesOutput>({ itens: res.value });
  };
}
