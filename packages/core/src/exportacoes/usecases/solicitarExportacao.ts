// packages/core/src/exportacoes/usecases/solicitarExportacao.ts

import { ErroApp, IdPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
import { ExportacoesRepositorio } from "../portasRepositorio";
import { SolicitarExportacaoInput, SolicitarExportacaoOutput } from "../tipos";
import { validarSolicitarExportacaoInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por solicitar uma nova exportação,
 * inicializando seu estado, parâmetros e metadados básicos no sistema.
 *
 * Este é o ponto de entrada do fluxo de exportação.
 */

/**
 * Cria a função de caso de uso para solicitar exportações.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório, relógio e gerador de identificadores.
 * @returns Função de caso de uso `solicitarExportacao`.
 */
export function createFnSolicitarExportacao(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  relogio: RelogioPorta;
  idPorta: IdPorta;
}) {
  /**
   * Solicita uma nova exportação.
   *
   * Fluxo:
   * - valida a entrada;
   * - materializa o instante atual;
   * - cria uma exportação com status inicial `PENDENTE`;
   * - devolve a exportação criada no contrato público do módulo.
   *
   * @param input Dados da exportação solicitada.
   * @returns `Ok({ exportacao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function solicitarExportacao(input: SolicitarExportacaoInput): Promise<Result<SolicitarExportacaoOutput, ErroApp>> {
    const validacao = validarSolicitarExportacaoInput(input);
    if (!validacao.ok) return validacao;

    const instante = deps.relogio.agora();

    const criada = await deps.exportacoesRepositorio.criarExportacao({
      exportacaoId: deps.idPorta.gerarId(),
      locatarioId: input.locatarioId,
      criadoPorUsuarioId: input.criadoPorUsuarioId ?? null,
      formato: input.formato,
      status: "PENDENTE",
      parametros: input.parametros ?? {},
      referenciaResultado: null,
      mensagemErro: null,
      criadoEm: instante,
      atualizadoEm: instante,
    });

    if (!criada.ok) return criada;

    return wrapOk({ exportacao: criada.value });
  };
}
