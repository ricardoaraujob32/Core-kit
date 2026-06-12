// packages/core/src/auditoria/usecases/listarAuditoriaPlataforma.ts

import { wrapOk } from "../../kernel";
import type { AuditoriaPlataformaRepositorio } from "../portasRepositorio";
import type { ListarAuditoriaPlataformaInput, ListarAuditoriaPlataformaOutput, ListarAuditoriaPlataformaResult } from "../tipos";
import { validarListarAuditoriaPlataformaInput } from "../validadores";
import { autorizarAuditoria, type PoliticaSegurancaAuditoriaPorta } from "../politicas";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnListarAuditoriaPlataforma(deps: {
  auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
  politicaSeguranca?: PoliticaSegurancaAuditoriaPorta;
}) {
  /**
   * 
   */
  return async function listarAuditoriaPlataforma(input: ListarAuditoriaPlataformaInput): ListarAuditoriaPlataformaResult {
    const validacao = validarListarAuditoriaPlataformaInput(input);
    if (!validacao.ok) return validacao;

    const autorizacao = await autorizarAuditoria(deps, {
      operacao: "AUDITORIA_PLATAFORMA_LISTAR",
      superadminUsuarioId: input.superadminUsuarioId ?? null,
      locatarioAlvoId: input.locatarioAlvoId ?? null,
      categoria: input.categoria ?? null,
      evento: input.evento ?? null,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const res = await deps.auditoriaPlataformaRepositorio.listarEventos(input);
    if (!res.ok) return res;

    return wrapOk<ListarAuditoriaPlataformaOutput>({
      itens: res.value,
    });
  };
}