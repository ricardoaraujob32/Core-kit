// packages/core/src/locatarios/usecases/atualizarLocatario.ts

import type { AtualizarLocatarioInput, AtualizarLocatarioOutput, AtualizarLocatarioResult } from "../tipos.js";
import type { LocatariosRepositorio } from "../portasRepositorio.js";
import { validarDocumentoLocatario, validarEmailLocatario, validarFusoHorarioLocatario, validarNomeLocatario } from "../validadores.js";
import { emailLocatarioJaExiste } from "../erros.js";
import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel/index.js";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas.js";
import { obterLocatarioObrigatorio } from "./helpers.js";
import { exigirEstadoOperacionalLocatario } from "../maquinaEstados.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnAtualizarLocatario(deps: {
  locatariosRepositorio: LocatariosRepositorio;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * 
   */
  return async function atualizarLocatario(input: AtualizarLocatarioInput): AtualizarLocatarioResult {
    return executarEmTransacao(deps.transacao, async () => {
      const locatario = await obterLocatarioObrigatorio({
        locatariosRepositorio: deps.locatariosRepositorio,
        locatarioId: input.locatarioId,
      });
      if (!locatario.ok) return locatario;

      const estadoOperacional = exigirEstadoOperacionalLocatario(locatario.value);
      if (!estadoOperacional.ok) return estadoOperacional;

      const autorizacao = await autorizarLocatario(deps, {
        operacao: "LOCATARIO_ATUALIZAR",
        locatarioId: locatario.value.locatarioId,
        locatario: locatario.value,
      });
      if (autorizacao && !autorizacao.ok) return autorizacao;

      let nome = locatario.value.nome;
      let email = locatario.value.email;
      let documento = locatario.value.documento;
      let fusoHorario = locatario.value.fusoHorario;

      if (input.nome !== undefined) {
        const nomeValidado = validarNomeLocatario(input.nome);
        if (!nomeValidado.ok) return nomeValidado;
        nome = nomeValidado.value;
      }

      if (input.email !== undefined) {
        const emailValidado = validarEmailLocatario(input.email);
        if (!emailValidado.ok) return emailValidado;

        const existente = await deps.locatariosRepositorio.buscarPorEmail({
          emailNormalizado: emailValidado.value,
        });
        if (!existente.ok) return existente;

        if (existente.value && existente.value.locatarioId !== locatario.value.locatarioId) {
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

      const atualizado = await deps.locatariosRepositorio.atualizar({
        ...locatario.value,
        nome,
        email,
        documento,
        fusoHorario,
        atualizadoEm: deps.relogio.agora(),
      });
      if (!atualizado.ok) return atualizado;

      return wrapOk<AtualizarLocatarioOutput>({ locatario: atualizado.value });
    });
  };
}
