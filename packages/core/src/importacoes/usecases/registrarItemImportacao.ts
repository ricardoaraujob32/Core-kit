// packages/core/src/importacoes/usecases/registrarItemImportacao.ts

import { ErroApp, IdPorta, RelogioPorta, Result } from "../../kernel";
import { erroImportacaoNaoEncontrada } from "../erros";
import { ImportacoesRepositorio, ItensImportacaoRepositorio } from "../portasRepositorio";
import { ItemImportacao, RegistrarItemImportacaoInput } from "../tipos";
import { validarRegistrarItemImportacaoInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por registrar itens individuais
 * dentro de uma importação existente.
 *
 * Este caso de uso é utilizado durante o processamento do arquivo de origem.
 */

/**
 * Cria a função de caso de uso para registrar itens de importação.
 *
 * @param deps Dependências externas (repositórios, relógio e gerador de IDs).
 * @returns Função de caso de uso `registrarItemImportacao`.
 */
export function createFnRegistrarItemImportacao(deps: {
  importacoesRepositorio: ImportacoesRepositorio;
  itensImportacaoRepositorio: ItensImportacaoRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
}) {
    /**
   * Registra um item dentro de uma importação existente.
   *
   * Regras:
   * - valida a entrada;
   * - a importação principal deve existir;
   * - o item nasce com status `PENDENTE`.
   *
   * @param input Dados do item a registrar.
   * @returns `Ok(item)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function registrarItemImportacao(input: RegistrarItemImportacaoInput): Promise<Result<ItemImportacao, ErroApp>> {
    const validacao = validarRegistrarItemImportacaoInput(input);
    if (!validacao.ok) return validacao;

    const importacao = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
    if (!importacao.ok) return importacao;
    if (!importacao.value) return erroImportacaoNaoEncontrada(input.importacaoId);

    return deps.itensImportacaoRepositorio.criarItem({
      itemImportacaoId: deps.idPorta.gerarId(),
      importacaoId: input.importacaoId,
      locatarioId: input.locatarioId,
      numeroLinha: input.numeroLinha,
      dadosBrutos: input.dadosBrutos,
      status: "PENDENTE",
      detalheErro: null,
      criadoEm: deps.relogio.agora(),
    });
  };
}
