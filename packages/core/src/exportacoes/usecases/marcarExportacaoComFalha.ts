// packages/core/src/exportacoes/usecases/marcarExportacaoComFalha.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
import { erroExportacaoNaoEncontrada, erroTransicaoStatusExportacaoInvalida } from "../erros";
import { ExportacoesRepositorio } from "../portasRepositorio";
import { Exportacao, MarcarExportacaoComFalhaInput } from "../tipos";
import { validarMarcarExportacaoComFalhaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por marcar uma exportação
 * como falha (`FALHOU`), registrando a mensagem de erro associada.
 */

/**
 * Cria a função de caso de uso para marcar exportações com falha.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório, relógio e transação opcional.
 * @returns Função de caso de uso `marcarExportacaoComFalha`.
 */
export function createFnMarcarExportacaoComFalha(deps: {
  exportacoesRepositorio: ExportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma exportação como `FALHOU`.
   *
   * Regras:
   * - a exportação deve existir;
   * - a transição só é permitida a partir de `PENDENTE` ou `EM_EXECUCAO`;
   * - registra a `mensagemErro`.
   *
   * @param input Dados da falha da exportação.
   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarExportacaoComFalha(input: MarcarExportacaoComFalhaInput): Promise<Result<Exportacao, ErroApp>> {
    const validacao = validarMarcarExportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.exportacoesRepositorio.buscarPorId(input.exportacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroExportacaoNaoEncontrada(input.exportacaoId);

      if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
        return erroTransicaoStatusExportacaoInvalida(
          atual.value.exportacaoId,
          atual.value.status,
          "FALHOU",
        );
      }

      return deps.exportacoesRepositorio.atualizarExportacao({
        ...atual.value,
        status: "FALHOU",
        mensagemErro: input.mensagemErro,
        atualizadoEm: deps.relogio.agora(),
      });
    });
  };
}
