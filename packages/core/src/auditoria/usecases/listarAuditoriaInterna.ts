// packages/core/src/auditoria/usecases/listarAuditoriaInterna.ts

import { wrapOk } from "../../kernel";
import type { AuditoriaInternaRepositorio } from "../portasRepositorio";
import type { ListarAuditoriaInternaInput, ListarAuditoriaInternaOutput, ListarAuditoriaInternaResult } from "../tipos";
import { validarListarAuditoriaInternaInput } from "../validadores";

/**
 * Cria o caso de uso responsável por listar a auditoria interna.
 *
 * @param deps Dependências externas necessárias para execução.
 * @returns Função `listarAuditoriaInterna`.
 */
export function createFnListarAuditoriaInterna(deps: { auditoriaInternaRepositorio: AuditoriaInternaRepositorio; }) {
  /**
   * Executa a listagem da trilha interna.
   *
   * @param input Filtros de consulta.
   * @returns `Ok(eventos)` ou `Err(ErroApp)`.
   */
  return async function listarAuditoriaInterna(input: ListarAuditoriaInternaInput): ListarAuditoriaInternaResult {
    const validacao = validarListarAuditoriaInternaInput(input);
    if (!validacao.ok) return validacao;

    const res = await deps.auditoriaInternaRepositorio.listarEventos(input);
    if (!res.ok) return res;

    return wrapOk<ListarAuditoriaInternaOutput>({
      itens: res.value,
    });
  };
}
