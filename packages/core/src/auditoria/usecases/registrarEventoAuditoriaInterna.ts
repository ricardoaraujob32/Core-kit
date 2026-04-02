// packages/core/src/auditoria/usecases/registrarEventoAuditoriaInterna.ts

import { wrapOk } from "../../kernel";
import type { AuditoriaInternaRepositorio } from "../portasRepositorio";
import type { RegistrarEventoAuditoriaInternaInput, RegistrarEventoAuditoriaInternaOutput, RegistrarEventoAuditoriaInternaResult } from "../tipos";
import { validarRegistrarEventoAuditoriaInternaInput } from "../validadores";

/**
 * Cria o caso de uso responsável por registrar evento na auditoria interna.
 *
 * @param deps Dependências externas necessárias para execução.
 * @returns Função `registrarEventoAuditoriaInterna`.
 */
export function createFnRegistrarEventoAuditoriaInterna(deps: { auditoriaInternaRepositorio: AuditoriaInternaRepositorio; }) {
  /**
   * Executa o registro do evento.
   *
   * @param input Dados do evento.
   * @returns `Ok(eventoPersistido)` ou `Err(ErroApp)`.
   */
  return async function registrarEventoAuditoriaInterna(input: RegistrarEventoAuditoriaInternaInput): RegistrarEventoAuditoriaInternaResult {
    const validacao = validarRegistrarEventoAuditoriaInternaInput(input);
    if (!validacao.ok) return validacao;

    const res = await deps.auditoriaInternaRepositorio.registrarEvento(input);
    if (!res.ok) return res;

    return wrapOk<RegistrarEventoAuditoriaInternaOutput>({
      evento: res.value,
    });
  };
}
