// packages/core/src/exportacoes/usecases/marcarExportacaoConcluida.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel/index.js";
import { erroExportacaoNaoEncontrada, erroTransicaoStatusExportacaoInvalida } from "../erros.js";
import { ExportacoesRepositorio } from "../portasRepositorio.js";
import { Exportacao, MarcarExportacaoConcluidaInput } from "../tipos.js";
import { validarMarcarExportacaoConcluidaInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por concluir com sucesso
 * o processamento de uma exportação.
 */

/**
 * Cria a função de caso de uso para concluir exportações.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório, relógio e transação opcional.
 * @returns Função de caso de uso `marcarExportacaoConcluida`.
 */
export function createFnMarcarExportacaoConcluida(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma exportação como `CONCLUIDO`.
   *
   * Regras:
   * - a exportação deve existir;
   * - a transição só é permitida a partir de `EM_EXECUCAO`;
   * - registra `referenciaResultado`;
   * - limpa `mensagemErro`.
   *
   * @param input Dados de conclusão da exportação.
   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarExportacaoConcluida(input: MarcarExportacaoConcluidaInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoConcluidaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (atual.value.status !== "EM_EXECUCAO") {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "CONCLUIDO",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "CONCLUIDO",
        referenciaResultado: input.referenciaResultado,
        mensagemErro: null,
        atualizadoEm: deps.relogio.agora(),
      });
    });
  };
}
