import { wrapOk } from "../../kernel";
import type { ProdutosRepositorio } from "../portasRepositorio";
import type { ListarProdutosInput, ListarProdutosOutput, ListarProdutosResult } from "../tipos";
import { validarLocatarioId, validarTipoProduto } from "../validadores";

export function createFnListarProdutos(deps: { produtosRepositorio: ProdutosRepositorio }) {
  return async function listarProdutos(input: ListarProdutosInput): ListarProdutosResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    if (input.tipo !== undefined) { const tipo = validarTipoProduto(input.tipo); if (!tipo.ok) return tipo; }
    const res = await deps.produtosRepositorio.listarPorLocatario({ locatarioId: locatarioId.value, tipo: input.tipo, cursor: input.cursor, limite: input.limite });
    if (!res.ok) return res;
    return wrapOk<ListarProdutosOutput>({ itens: res.value });
  };
}
