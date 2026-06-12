// packages/core/src/importacoes/usecases/listarImportacoesLocatario.ts

import { ErroApp, Result } from "../../kernel/index.js";
import { ImportacoesRepositorio } from "../portasRepositorio.js";
import { Importacao, ListarImportacoesLocatarioInput } from "../tipos.js";
import { validarListarImportacoesLocatarioInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar as importações
 * associadas a um locatário.
 */

/**
 * Cria a função de caso de uso para listar importações por locatário.
 *
 * @param deps Dependência de acesso às importações.
 * @returns Função de caso de uso `listarImportacoesLocatario`.
 */
export function createFnListarImportacoesLocatario(deps: {importacoesRepositorio: ImportacoesRepositorio}) {
  /**
   * Lista importações de um locatário.
   *
   * @param input Locatário alvo da consulta.
   * @returns Lista de importações em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarImportacoesLocatario(input: ListarImportacoesLocatarioInput): Promise<Result<Importacao[], ErroApp>> {
    const validacao = validarListarImportacoesLocatarioInput(input);
    if (!validacao.ok) return validacao;

    return deps.importacoesRepositorio.listarPorLocatario(input.locatarioId);
  };
}
