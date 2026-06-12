// packages/core/src/importacoes/usecases/listarItensImportacao.ts

import { ErroApp, Result } from "../../kernel/index.js";
import { ItensImportacaoRepositorio } from "../portasRepositorio.js";
import { ItemImportacao, ListarItensImportacaoInput } from "../tipos.js";
import { validarListarItensImportacaoInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar os itens
 * pertencentes a uma importação específica.
 */

/**
 * Cria a função de caso de uso para listar itens de importação.
 *
 * @param deps Dependência de acesso aos itens de importação.
 * @returns Função de caso de uso `listarItensImportacao`.
 */
export function createFnListarItensImportacao(deps: {itensImportacaoRepositorio: ItensImportacaoRepositorio}) {
    /**
   * Lista itens de uma importação dentro do locatário informado.
   *
   * @param input Importação e locatário alvo da consulta.
   * @returns Lista de itens em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarItensImportacao(input: ListarItensImportacaoInput): Promise<Result<ItemImportacao[], ErroApp>> {
    const validacao = validarListarItensImportacaoInput(input);
    if (!validacao.ok) return validacao;

    return deps.itensImportacaoRepositorio.listarPorImportacao(
      input.importacaoId,
      input.locatarioId,
    );
  };
}
