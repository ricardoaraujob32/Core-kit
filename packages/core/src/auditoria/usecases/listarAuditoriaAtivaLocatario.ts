// packages/core/src/auditoria/usecases/listarAuditoriaAtivaLocatario.ts

import { wrapOk } from "../../kernel";
import type { AuditoriaAtivaLocatarioRepositorio } from "../portasRepositorio";
import type { ListarAuditoriaAtivaLocatarioInput, ListarAuditoriaAtivaLocatarioOutput, ListarAuditoriaAtivaLocatarioResult } from "../tipos";
import { validarListarAuditoriaAtivaLocatarioInput } from "../validadores";

/**
 * Cria o caso de uso responsável por listar a auditoria ativa do locatário.
 *
 * @param deps Dependências externas necessárias para execução.
 * @returns Função `listarAuditoriaAtivaLocatario`.
 */
export function createFnListarAuditoriaAtivaLocatario(deps: { auditoriaAtivaLocatarioRepositorio: AuditoriaAtivaLocatarioRepositorio; }) {
  /**
   * Executa a listagem da visão auditável do cliente.
   *
   * @param input Filtros de consulta.
   * @returns `Ok(eventos)` ou `Err(ErroApp)`.
   */
  return async function listarAuditoriaAtivaLocatario(input: ListarAuditoriaAtivaLocatarioInput): ListarAuditoriaAtivaLocatarioResult {
    const validacao = validarListarAuditoriaAtivaLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const res = await deps.auditoriaAtivaLocatarioRepositorio.listarEventos(input);
    if (!res.ok) return res;

    return wrapOk<ListarAuditoriaAtivaLocatarioOutput>({
      itens: res.value,
    });
  };
}
