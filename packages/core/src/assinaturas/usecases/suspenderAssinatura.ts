// packages/core/src/assinaturas/usecases/suspenderAssinatura.ts

import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
import { erroAssinaturaNaoEncontrada } from "../erros";
import { transicionarEstadoAssinatura } from "../maquinaEstados";
import { AssinaturasRepositorio } from "../portasRepositorio";
import { SuspenderAssinaturaInput, SuspenderAssinaturaOutput, SuspenderAssinaturaResult } from "../tipos";
import { validarSuspenderAssinaturaInput } from "../validadores";

/**
 * Propósito do arquivo:
 * Define o caso de uso responsável por suspender uma assinatura ativa,
 * alterando seu estado para `SUSPENSA`.
 */

/**
 * Cria a função de caso de uso para suspender assinaturas.
 *
 * @param deps Dependências externas necessárias para execução do caso de uso,
 * incluindo repositório de assinaturas, relógio e transação opcional.
 * @returns Função de caso de uso `suspenderAssinatura`.
 */
export function createFnSuspenderAssinatura(deps: {
  assinaturasRepositorio: AssinaturasRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
    /**
 * Suspende uma assinatura.
 *
 * Regras:
 * - valida a entrada;
 * - a assinatura deve existir;
 * - a transição só é permitida a partir de `ATIVA`.
 *
 * @param input Dados da suspensão da assinatura.
 * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
 */
  return async function suspenderAssinatura(input: SuspenderAssinaturaInput): SuspenderAssinaturaResult{
    const validacao = validarSuspenderAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const proximoStatus = transicionarEstadoAssinatura({
        assinaturaId: atual.value.assinaturaId,
        statusAtual: atual.value.status,
        evento: "SUSPENDER",
      });
      if (!proximoStatus.ok) return proximoStatus;

      const atualizada = await deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: proximoStatus.value,
        atualizadaEm: deps.relogio.agora(),
      });
      if (!atualizada.ok) return atualizada;

      return wrapOk<SuspenderAssinaturaOutput>({
        assinatura: atualizada.value,
      });
    });
  };
}
