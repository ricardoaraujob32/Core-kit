// packages/core/src/importacoes/usecases/marcarImportacaoComFalha.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel/index.js";
import { erroImportacaoNaoEncontrada, erroTransicaoStatusImportacaoInvalida } from "../erros.js";
import { ImportacoesRepositorio } from "../portasRepositorio.js";
import { Importacao, MarcarImportacaoComFalhaInput } from "../tipos.js";
import { validarMarcarImportacaoComFalhaInput } from "../validadores.js";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por marcar uma importação
 * como falha (`FALHOU`), registrando o motivo do erro.
 */

/**
 * Cria a função de caso de uso para marcar importação com falha.
 *
 * @param deps Dependências externas (repositório, relógio e transação opcional).
 * @returns Função de caso de uso `marcarImportacaoComFalha`.
 */
export function createFnMarcarImportacaoComFalha(deps: {
  importacoesRepositorio: ImportacoesRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * Marca uma importação como `FALHOU`.
   *
   * Regras:
   * - a importação deve existir;
   * - a transição só é permitida a partir de `PENDENTE` ou `EM_EXECUCAO`;
   * - registra `mensagemErro` e `finalizadoEm`.
   *
   * @param input Dados da falha da importação.
   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function marcarImportacaoComFalha(input: MarcarImportacaoComFalhaInput): Promise<Result<Importacao, ErroApp>> {
    const validacao = validarMarcarImportacaoComFalhaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.importacoesRepositorio.buscarPorId(input.importacaoId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroImportacaoNaoEncontrada(input.importacaoId);

      if (!["PENDENTE", "EM_EXECUCAO"].includes(atual.value.status)) {
        return erroTransicaoStatusImportacaoInvalida(
          "importacao",
          atual.value.importacaoId,
          atual.value.status,
          "FALHOU",
        );
      }

      const instante = deps.relogio.agora();

      return deps.importacoesRepositorio.atualizarImportacao({
        ...atual.value,
        status: "FALHOU",
        mensagemErro: input.mensagemErro,
        finalizadoEm: instante,
        atualizadoEm: instante,
      });
    });
  };
}
