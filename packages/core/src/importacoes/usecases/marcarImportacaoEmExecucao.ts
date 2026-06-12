// packages/core/src/importacoes/usecases/marcarImportacaoEmExecucao.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel/index.js";
import { erroImportacaoNaoEncontrada, erroTransicaoStatusImportacaoInvalida } from "../erros.js";
import { ImportacoesRepositorio } from "../portasRepositorio.js";
import { Importacao, MarcarImportacaoEmExecucaoInput } from "../tipos.js";
import { validarMarcarImportacaoEmExecucaoInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por iniciar o processamento
 * de uma importação, alterando seu estado para `EM_EXECUCAO`.
 */

/**
 * Cria a função de caso de uso para iniciar execução de importação.
 *
 * @param deps Dependências externas (repositório, relógio e transação opcional).
 * @returns Função de caso de uso `marcarImportacaoEmExecucao`.
 */
export function createFnMarcarImportacaoEmExecucao(deps: {
  importacoesRepositorio: ImportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma importação como `EM_EXECUCAO`.
   *
   * Regras:
   * - a importação deve existir;
   * - a transição só é permitida a partir de `PENDENTE`;
   * - registra `iniciadoEm`.
   *
   * @param input Identificador da importação.
   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarImportacaoEmExecucao(input: MarcarImportacaoEmExecucaoInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoEmExecucaoInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (atual.value.status !== "PENDENTE") {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "EM_EXECUCAO",
        );
      }

      const instante = deps.relogio.agora();

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "EM_EXECUCAO",
        iniciadoEm: instante,
        atualizadoEm: instante,
      });
    });
  };
}
