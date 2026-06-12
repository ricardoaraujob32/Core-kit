//

import type { ProdutosRepositorio } from "../portasRepositorio.js";
import type {
  ExcluirProdutoInput,
  ExcluirProdutoOutput,
  ExcluirProdutoResult,
} from "../tipos.js";
import { validarLocatarioId, validarProdutoId } from "../validadores.js";
import { produtoNaoEncontrado } from "../erros.js";
import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel/index.js";

export function createFnExcluirProduto(deps: {
  produtosRepositorio: ProdutosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  return async function excluirProduto(
    input: ExcluirProdutoInput,
  ): ExcluirProdutoResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    const produtoId = validarProdutoId(input.produtoId);
    if (!produtoId.ok) return produtoId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.produtosRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
        produtoId: produtoId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return produtoNaoEncontrado(produtoId.value);

      const agora = deps.relogio.agora();

      const atualizado = await deps.produtosRepositorio.atualizar({
        ...atual.value,
        excluidoEm: agora,
        excluidoPor: input.excluidoPor ?? null,
        excluidoMotivo: input.excluidoMotivo?.trim() || null,
        atualizadoEm: agora,
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<ExcluirProdutoOutput>({
        produto: atualizado.value,
      });
    });
  };
}