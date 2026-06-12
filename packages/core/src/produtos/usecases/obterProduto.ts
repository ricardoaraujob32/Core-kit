import { wrapOk } from "../../kernel/index.js";
import type { ProdutosRepositorio } from "../portasRepositorio.js";
import type { ObterProdutoInput, ObterProdutoOutput, ObterProdutoResult } from "../tipos.js";
import { produtoNaoEncontrado } from "../erros.js";
import { validarLocatarioId, validarProdutoId } from "../validadores.js";

export function createFnObterProduto(deps: { produtosRepositorio: ProdutosRepositorio }) {
  return async function obterProduto(input: ObterProdutoInput): ObterProdutoResult {
    const locatarioId = validarLocatarioId(input.locatarioId); if (!locatarioId.ok) return locatarioId;
    const produtoId = validarProdutoId(input.produtoId); if (!produtoId.ok) return produtoId;
    const res = await deps.produtosRepositorio.buscarPorId({ locatarioId: locatarioId.value, produtoId: produtoId.value });
    if (!res.ok) return res;
    if (!res.value) return produtoNaoEncontrado(produtoId.value);
    return wrapOk<ObterProdutoOutput>({ produto: res.value });
  };
}
