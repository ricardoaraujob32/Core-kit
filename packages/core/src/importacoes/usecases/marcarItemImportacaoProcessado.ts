// packages/core/src/importacoes/usecases/marcarItemImportacaoProcessado.ts

import { ErroApp, Result } from "../../kernel";
import { erroItemImportacaoNaoEncontrado, erroTransicaoStatusImportacaoInvalida } from "../erros";
import { ItensImportacaoRepositorio } from "../portasRepositorio";
import { ItemImportacao, MarcarItemImportacaoProcessadoInput } from "../tipos";
import { validarMarcarItemImportacaoProcessadoInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por marcar um item de importação
 * como processado com sucesso (`CONCLUIDO`).
 */

/**
 * Cria a função de caso de uso para marcar item como processado.
 *
 * @param deps Dependência de acesso aos itens de importação.
 * @returns Função de caso de uso `marcarItemImportacaoProcessado`.
 */
export function createFnMarcarItemImportacaoProcessado(deps: {itensImportacaoRepositorio: ItensImportacaoRepositorio}) {
  /**
   * Marca um item de importação como `CONCLUIDO`.
   *
   * Regras:
   * - o item deve existir;
   * - a transição só é permitida a partir de `PENDENTE` ou `EM_EXECUCAO`;
   * - limpa `detalheErro`.
   *
   * @param input Identificador do item.
   * @returns `Ok(itemAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarItemImportacaoProcessado(input: MarcarItemImportacaoProcessadoInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarMarcarItemImportacaoProcessadoInput(input);
    if (!validacao.ok) return validacao;

    const atual = await deps.itensImportacaoRepositorio.buscarPorId(input.itemImportacaoId);
    if (!atual.ok) return atual;
    if (!atual.value) return erroItemImportacaoNaoEncontrado(input.itemImportacaoId);

    if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
      return erroTransicaoStatusImportacaoInvalida(
        "item_importacao",
        atual.value.itemImportacaoId,
        atual.value.status,
        "CONCLUIDO",
      );
    }

    return deps.itensImportacaoRepositorio.atualizarItem({
      ...atual.value,
      status: "CONCLUIDO",
      detalheErro: null,
    });
  };
}
