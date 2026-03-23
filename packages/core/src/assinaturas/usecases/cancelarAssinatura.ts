// packages/core/src/assinaturas/usecases/cancelarAssinatura.ts

import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
import { erroAssinaturaNaoEncontrada, erroTransicaoStatusInvalida } from "../erros";
import { AssinaturasRepositorio } from "../portasRepositorio";
import { Assinatura, CancelarAssinaturaInput } from "../tipos";
import { validarCancelarAssinaturaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por cancelar uma assinatura,
 * alterando seu estado para `CANCELADA`.
 */

/**
 * Cria a função de caso de uso para cancelar assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório de assinaturas, relógio e transação opcional.
 * @returns Função de caso de uso `cancelarAssinatura`.
 */
export function createFnCancelarAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
    /**
 * Cancela uma assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - a assinatura deve existir;
 * - não pode estar previamente `ENCERRADA` ou `CANCELADA`;
 * - registra a data de encerramento informada ou o instante atual.
 *
 * @param input Dados do cancelamento da assinatura.
 * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function cancelarAssinatura(input: CancelarAssinaturaInput): Promise<Result<Assinatura, ErroApp>> {
    const validacao = validarCancelarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      if (["ENCERRADA", "CANCELADA"].includes(atual.value.status)) {
        return erroTransicaoStatusInvalida(
          atual.value.assinaturaId,
          atual.value.status,
          "CANCELADA",
        );
      }

      const instante = deps.relogio.agora();

      return deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: "CANCELADA",
        encerradaEm: input.encerradaEm ?? instante,
        atualizadaEm: instante,
      });
    });
  };
}
