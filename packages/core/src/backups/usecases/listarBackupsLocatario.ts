// packages/core/src/backups/usecases/listarBackupsLocatario.ts

import { ExportacoesRepositorio } from "../../exportacoes/index.js";
import { ErroApp, Result, wrapOk } from "../../kernel/index.js";
import { ehBackupLocatario, mapBackup } from "../temp.js";
import { ListarBackupsLocatarioInput, ListarBackupsLocatarioOutput } from "../tipos.js";
import { validarListarBackupsLocatarioInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por listar os backups lógicos
 * associados a um locatário específico.
 */

/**
 * Cria a função de caso de uso para listar backups por locatário.
 *
 * @param deps Dependência de acesso ao repositório de exportações.
 * @returns Função de caso de uso `listarBackupsLocatario`.
 */
export function createFnListarBackupsLocatario(deps: {exportacoesRepositorio: ExportacoesRepositorio}) {
    /**
   * Lista os backups lógicos de um locatário.
   *
   * Fluxo:
   * - valida a entrada;
   * - lista exportações do locatário;
   * - filtra apenas as exportações classificadas como backup;
   * - converte o resultado para o contrato público do módulo.
   *
   * @param input Locatário alvo da consulta.
   * @returns `Ok({ locatarioId, backups })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function listarBackupsLocatario(input: ListarBackupsLocatarioInput): Promise<Result<ListarBackupsLocatarioOutput, ErroApp>> {
    const validacao = validarListarBackupsLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const exportacoes = await deps.exportacoesRepositorio.listarPorLocatario(input.locatarioId);
    if (!exportacoes.ok) return exportacoes;

    return wrapOk({
      locatarioId: input.locatarioId,
      backups: exportacoes.value.filter(ehBackupLocatario).map(mapBackup),
    });
  };
}
