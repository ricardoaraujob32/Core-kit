// packages/core/src/importacoes/usecases/marcarImportacaoConcluida.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel/index.js";
import { erroImportacaoNaoEncontrada, erroTransicaoStatusImportacaoInvalida } from "../erros.js";
import { ImportacoesRepositorio } from "../portasRepositorio.js";
import { Importacao, MarcarImportacaoConcluidaInput } from "../tipos.js";
import { validarMarcarImportacaoConcluidaInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por finalizar com sucesso
 * o processamento de uma importação (`CONCLUIDO`).
 */

/**
 * Cria a função de caso de uso para concluir importação.
 *
 * @param deps Dependências externas (repositório, relógio e transação opcional).
 * @returns Função de caso de uso `marcarImportacaoConcluida`.
 */
export function createFnMarcarImportacaoConcluida(deps: {
  importacoesRepositorio: ImportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma importação como `CONCLUIDO`.
   *
   * Regras:
   * - a importação deve existir;
   * - a transição só é permitida a partir de `EM_EXECUCAO`;
   * - pode atualizar estatísticas finais;
   * - registra `finalizadoEm`.
   *
   * @param input Dados de conclusão da importação.
   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarImportacaoConcluida(input: MarcarImportacaoConcluidaInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoConcluidaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (atual.value.status !== "EM_EXECUCAO") {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "CONCLUIDO",
        );
      }

      const instante = deps.relogio.agora();

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "CONCLUIDO",
        estatisticas: input.estatisticas ?? atual.value.estatisticas,
        finalizadoEm: instante,
        atualizadoEm: instante,
      });
    });
  };
}
