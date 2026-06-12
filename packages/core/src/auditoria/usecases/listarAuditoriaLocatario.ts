// packages/core/src/auditoria/usecases/listarAuditoriaLocatario.ts

import { wrapOk } from "../../kernel/index.js";
import type { AuditoriaLocatarioRepositorio } from "../portasRepositorio.js";
import type { ListarAuditoriaLocatarioInput, ListarAuditoriaLocatarioOutput, ListarAuditoriaLocatarioResult } from "../tipos.js";
import { validarListarAuditoriaLocatarioInput } from "../validadores.js";
import { autorizarAuditoria, type PoliticaSegurancaAuditoriaPorta } from "../politicas.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnListarAuditoriaLocatario(deps: {
  auditoriaLocatarioRepositorio: AuditoriaLocatarioRepositorio;
  politicaSeguranca?: PoliticaSegurancaAuditoriaPorta;
}) {
  /**
   * 
   */
  return async function listarAuditoriaLocatario(input: ListarAuditoriaLocatarioInput): ListarAuditoriaLocatarioResult {
    const validacao = validarListarAuditoriaLocatarioInput(input);
    if (!validacao.ok) return validacao;

    const autorizacao = await autorizarAuditoria(deps, {
      operacao: "AUDITORIA_LOCATARIO_LISTAR",
      locatarioId: input.locatarioId,
      usuarioId: input.usuarioId ?? null,
      categoria: input.categoria ?? null,
      evento: input.evento ?? null,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const res = await deps.auditoriaLocatarioRepositorio.listarEventos(input);
    if (!res.ok) return res;

    return wrapOk<ListarAuditoriaLocatarioOutput>({
      itens: res.value,
    });
  };
}
