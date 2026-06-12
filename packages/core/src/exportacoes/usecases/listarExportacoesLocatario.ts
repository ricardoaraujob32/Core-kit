// packages/core/src/exportacoes/usecases/listarExportacoesLocatario.ts

import { ErroApp, Result, wrapOk } from "../../kernel/index.js";
import { ExportacoesRepositorio } from "../portasRepositorio.js";
import { ListarExportacoesLocatarioInput, ListarExportacoesLocatarioOutput } from "../tipos.js";
import { validarListarExportacoesLocatarioInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar as exportações
 * associadas a um locatário específico.
 */

/**
 * Cria a função de caso de uso para listar exportações por locatário.
 *
 * @param deps Dependência de acesso ao repositório de exportações.
 * @returns Função de caso de uso `listarExportacoesLocatario`.
 */
export function createFnListarExportacoesLocatario(deps: {exportacoesRepositorio: ExportacoesRepositorio}) {
  /**
   * Lista exportações de um locatário.
   *
   * Fluxo:
   * - valida a entrada;
   * - consulta o repositório por `locatarioId`;
   * - adapta a resposta para o contrato público `{ locatarioId, exportacoes }`.
   *
   * @param input Locatário alvo da consulta.
   * @returns `Ok({ locatarioId, exportacoes })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarExportacoesLocatario(input: ListarExportacoesLocatarioInput): Promise<Result<ListarExportacoesLocatarioOutput, ErroApp>> {
    const validacao = validarListarExportacoesLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const listagem = await deps.exportacoesRepositorio.listarPorLocatario(input.locatarioId);
    if (!listagem.ok) return listagem;

    return wrapOk({
      locatarioId: input.locatarioId,
      exportacoes: listagem.value,
    });
  };
}
