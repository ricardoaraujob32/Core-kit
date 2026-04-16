// packages/core/src/locatarios/usecases/atualizarLocatario.ts

import type { AtualizarLocatarioInput, AtualizarLocatarioOutput, AtualizarLocatarioResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarDocumentoLocatario, validarEmailLocatario, validarFusoHorarioLocatario, validarLocatarioId, validarNomeLocatario } from "../validadores";
import { emailLocatarioJaExiste, locatarioNaoEncontrado } from "../erros";
import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarLocatario(deps: {
  locatarioRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
}) {
  /**
   * 
   */
  return async function atualizarLocatario(input: AtualizarLocatarioInput): AtualizarLocatarioResult {
    const locatarioId = validarLocatarioId(input.locatarioId);
    if (!locatarioId.ok) return locatarioId;

    return executarEmTransacao(deps.transacao, async () => {
      const atual = await deps.locatarioRepositorio.buscarPorId({
        locatarioId: locatarioId.value,
      });
      if (!atual.ok) return atual;
      if (!atual.value) return locatarioNaoEncontrado(locatarioId.value);

      let nome = atual.value.nome;
      let email = atual.value.email;
      let documento = atual.value.documento;
      let fusoHorario = atual.value.fusoHorario;

      if (input.nome !== undefined) {
        const nomeValidado = validarNomeLocatario(input.nome);
        if (!nomeValidado.ok) return nomeValidado;
        nome = nomeValidado.value;
      }

      if (input.email !== undefined) {
        const emailValidado = validarEmailLocatario(input.email);
        if (!emailValidado.ok) return emailValidado;

        const existente = await deps.locatarioRepositorio.buscarPorEmail({
          emailNormalizado: emailValidado.value,
        });
        if (!existente.ok) return existente;

        if (existente.value && existente.value.locatarioId !== atual.value.locatarioId) {
          return emailLocatarioJaExiste(emailValidado.value);
        }

        email = emailValidado.value;
      }

      if (input.documento !== undefined) {
        const documentoValidado = validarDocumentoLocatario(input.documento);
        if (!documentoValidado.ok) return documentoValidado;
        documento = documentoValidado.value;
      }

      if (input.fusoHorario !== undefined) {
        const fusoValidado = validarFusoHorarioLocatario(input.fusoHorario);
        if (!fusoValidado.ok) return fusoValidado;
        fusoHorario = fusoValidado.value;
      }

      const atualizado = await deps.locatarioRepositorio.atualizar({
        ...atual.value,
        nome,
        email,
        documento,
        fusoHorario,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<AtualizarLocatarioOutput>({
        locatario: atualizado.value,
      });
    });
  };
}
