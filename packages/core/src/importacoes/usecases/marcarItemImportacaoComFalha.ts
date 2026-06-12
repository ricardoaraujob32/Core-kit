// packages/core/src/importacoes/usecases/marcarItemImportacaoComFalha.ts

import { ErroApp, Result } from "../../kernel/index.js";
import { erroItemImportacaoNaoEncontrado, erroTransicaoStatusImportacaoInvalida } from "../erros.js";
import { ItensImportacaoRepositorio } from "../portasRepositorio.js";
import { ItemImportacao, MarcarItemImportacaoComFalhaInput } from "../tipos.js";
import { validarMarcarItemImportacaoComFalhaInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por marcar um item de importação
 * como falho (`FALHOU`), registrando detalhes do erro ocorrido.
 */

/**
 * Cria a função de caso de uso para marcar item com falha.
 *
 * @param deps Dependência de acesso aos itens de importação.
 * @returns Função de caso de uso `marcarItemImportacaoComFalha`.
 */
export function createFnMarcarItemImportacaoComFalha(deps: {itensImportacaoRepositorio: ItensImportacaoRepositorio}) {
   /**
   * Marca um item de importação como `FALHOU`.
   *
   * Regras:
   * - o item deve existir;
   * - a transição só é permitida a partir de `PENDENTE` ou `EM_EXECUCAO`;
   * - registra `detalheErro`.
   *
   * @param input Dados da falha do item.
   * @returns `Ok(itemAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarItemImportacaoComFalha(input: MarcarItemImportacaoComFalhaInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarMarcarItemImportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    const atual = await deps.itensImportacaoRepositorio.buscarPorId(input.itemImportacaoId);
    if (!atual.ok) return atual;
    if (!atual.value) return erroItemImportacaoNaoEncontrado(input.itemImportacaoId);

    if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
      return erroTransicaoStatusImportacaoInvalida(
        "item_importacao",
        atual.value.itemImportacaoId,
        atual.value.status,
        "FALHOU",
      );
    }

    return deps.itensImportacaoRepositorio.atualizarItem({
      ...atual.value,
      status: "FALHOU",
      detalheErro: input.detalheErro,
    });
  };
}
