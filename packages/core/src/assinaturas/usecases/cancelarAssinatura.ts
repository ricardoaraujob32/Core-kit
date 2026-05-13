// packages/core/src/assinaturas/usecases/cancelarAssinatura.ts

import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
import { erroAssinaturaNaoEncontrada } from "../erros";
import { transicionarEstadoAssinatura } from "../maquinaEstados";
import { autorizarAssinatura, PoliticaSegurancaAssinaturasPorta } from "../politicas";
import { AssinaturasRepositorio } from "../portasRepositorio";
import { CancelarAssinaturaInput, CancelarAssinaturaOutput, CancelarAssinaturaResult } from "../tipos";
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
  politicaSeguranca?: PoliticaSegurancaAssinaturasPorta;
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
  return async function cancelarAssinatura(input: CancelarAssinaturaInput): CancelarAssinaturaResult {
    const validacao = validarCancelarAssinaturaInput(input);
    if (!validacao.ok) return validacao;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.assinaturasRepositorio.buscarPorId(input.assinaturaId);
      if (!atual.ok) return atual;
      if (!atual.value) return erroAssinaturaNaoEncontrada(input.assinaturaId);

      const proximoStatus = transicionarEstadoAssinatura({
        assinaturaId: atual.value.assinaturaId,
        statusAtual: atual.value.status,
        evento: "CANCELAR",
      });
      if (!proximoStatus.ok) return proximoStatus;

      const instante = deps.relogio.agora();

      const atualizada = await deps.assinaturasRepositorio.atualizarAssinatura({
        ...atual.value,
        status: proximoStatus.value,
        encerradaEm: input.encerradaEm ?? instante,
        atualizadaEm: instante,
      });
      if (!atualizada.ok) return atualizada;

      const autorizacao = await autorizarAssinatura(deps, {
        operacao: "ASSINATURA_CANCELAR",
        locatarioId: atual.value.locatarioId,
        assinaturaId: atual.value.assinaturaId,
        assinatura: atual.value,
        dados: {
          motivo: input.motivo,
          encerradaEm: input.encerradaEm,
        },
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      return wrapOk<CancelarAssinaturaOutput>({
        assinatura: atualizada.value,
      });
    });
  };
}
