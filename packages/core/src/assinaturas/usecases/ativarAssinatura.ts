// packages/core/src/assinaturas/usecases/ativarAssinatura.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
import { erroAssinaturaNaoEncontrada, erroTransicaoStatusInvalida } from "../erros";
import { AssinaturasRepositorio } from "../portasRepositorio";
import { Assinatura, AtivarAssinaturaInput } from "../tipos";
import { validarAtivarAssinaturaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por ativar uma assinatura,
 * alterando seu estado para `ATIVA`.
 */

/**
 * Cria a função de caso de uso para ativar assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório de assinaturas, relógio e transação opcional.
 * @returns Função de caso de uso `ativarAssinatura`.
 */
export function createFnAtivarAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}){ 
   /**
 * Ativa uma assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - a assinatura deve existir;
 * - a transição só é permitida a partir de `RASCUNHO` ou `SUSPENSA`.
 *
 * @param input Dados da ativação da assinatura.
 * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function ativarAssinatura(input: AtivarAssinaturaInput): Promise<Result<Assinatura, ErroApp>> {
    const validacao = validarAtivarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      if (!["RASCUNHO", "SUSPENSA"].includes(atual.value.status)) {
        return erroTransicaoStatusInvalida(
          atual.value.assinaturaId,
          atual.value.status,
          "ATIVA",
        );
      }

      return deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: "ATIVA",
        atualizadaEm: deps.relogio.agora(),
      });
    });
  };
}
