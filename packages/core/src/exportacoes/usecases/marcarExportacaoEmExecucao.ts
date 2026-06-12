// packages/core/src/exportacoes/usecases/marcarExportacaoEmExecucao.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel/index.js";
import { erroExportacaoNaoEncontrada, erroTransicaoStatusExportacaoInvalida } from "../erros.js";
import { ExportacoesRepositorio } from "../portasRepositorio.js";
import { Exportacao, MarcarExportacaoEmExecucaoInput } from "../tipos.js";
import { validarMarcarExportacaoEmExecucaoInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por iniciar o processamento
 * de uma exportação, alterando seu estado para `EM_EXECUCAO`.
 */

/**
 * Cria a função de caso de uso para iniciar a execução de exportações.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório, relógio e transação opcional.
 * @returns Função de caso de uso `marcarExportacaoEmExecucao`.
 */
export function createFnMarcarExportacaoEmExecucao(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma exportação como `EM_EXECUCAO`.
   *
   * Regras:
   * - a exportação deve existir;
   * - a transição só é permitida a partir de `PENDENTE`.
   *
   * @param input Identificador da exportação.
   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarExportacaoEmExecucao(input: MarcarExportacaoEmExecucaoInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoEmExecucaoInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (atual.value.status !== "PENDENTE") {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "EM_EXECUCAO",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "EM_EXECUCAO",
        atualizadoEm: deps.relogio.agora(),
      });
    });
  };
}
