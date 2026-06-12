// packages/core/src/importacoes/usecases/solicitarImportacao.ts

import { ErroApp, IdPorta, RelogioPorta, Result, wrapOk } from "../../kernel/index.js";
import { ImportacoesRepositorio } from "../portasRepositorio.js";
import { SolicitarImportacaoInput, SolicitarImportacaoOutput } from "../tipos.js";
import { validarSolicitarImportacaoInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por solicitar uma nova importação,
 * inicializando seu estado e metadados básicos no sistema.
 *
 * Este é o ponto de entrada do fluxo de importação.
 */

/**
 * Cria a função de caso de uso para solicitar importações.
 *
 * @param deps Dependências externas (repositório, relógio e gerador de IDs).
 * @returns Função de caso de uso `solicitarImportacao`.
 */
export function createFnSolicitarImportacao(deps: {
  importacoesRepositorio: ImportacoesRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
}) {
    /**
   * Solicita uma nova importação.
   *
   * Fluxo:
   * - valida a entrada;
   * - materializa o instante atual;
   * - cria uma importação com status inicial `PENDENTE`;
   * - inicializa estatísticas vazias;
   * - devolve a importação criada.
   *
   * @param input Dados da importação solicitada.
   * @returns `Ok({ importacao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function solicitarImportacao(input: SolicitarImportacaoInput): Promise<Result<SolicitarImportacaoOutput, ErroApp>> {
    const validacao = validarSolicitarImportacaoInput(input);
    if (!validacao.ok) return validacao;

    const instante = deps.relogio.agora();

    const criada = await deps.importacoesRepositorio.criarImportacao({
      importacaoId: deps.idPorta.gerarId(),
      locatarioId: input.locatarioId,
      criadoPorUsuarioId: input.criadoPorUsuarioId ?? null,
      tipoOrigem: input.tipoOrigem,
      referenciaOrigem: input.referenciaOrigem ?? null,
      status: "PENDENTE",
      mapeamentoColunas: input.mapeamentoColunas ?? {},
      estatisticas: {},
      mensagemErro: null,
      iniciadoEm: null,
      finalizadoEm: null,
      criadoEm: instante,
      atualizadoEm: instante,
    });

    if (!criada.ok) return criada;

    return wrapOk({ importacao: criada.value });
  };
}
