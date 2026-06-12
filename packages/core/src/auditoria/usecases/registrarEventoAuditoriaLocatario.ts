// packages/core/src/auditoria/usecases/registrarEventoAuditoriaLocatario.ts

import { wrapOk } from "../../kernel/index.js";
import { erroAuditoriaInvalida } from "../erros.js";
import type { AuditoriaLocatarioRepositorio } from "../portasRepositorio.js";
import { resolverEventoAuditoria } from "../resolverEventoAuditoria.js";
import type { RegistrarEventoAuditoriaLocatarioInput, RegistrarEventoAuditoriaLocatarioOutput, RegistrarEventoAuditoriaLocatarioResult } from "../tipos.js";
import { autorizarAuditoria, type PoliticaSegurancaAuditoriaPorta } from "../politicas.js";
import { validarRegistrarEventoAuditoriaLocatarioInput } from "../validadores.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRegistrarEventoAuditoriaLocatario(deps: {
  auditoriaLocatarioRepositorio: AuditoriaLocatarioRepositorio;
  politicaSeguranca?: PoliticaSegurancaAuditoriaPorta;
}) {
  /**
   * 
   */
  return async function registrarEventoAuditoriaLocatario(input: RegistrarEventoAuditoriaLocatarioInput): RegistrarEventoAuditoriaLocatarioResult {
    const validacao = validarRegistrarEventoAuditoriaLocatarioInput(input);
    if (!validacao.ok) return validacao;

    let defEvento: ReturnType<typeof resolverEventoAuditoria>;

    try {
      defEvento = resolverEventoAuditoria(input.evento);
    } catch {
      return erroAuditoriaInvalida({
        campo: "evento",
        valor: input.evento,
        motivo: "evento_nao_mapeado",
      });
    }

    if (defEvento.destino !== "LOCATARIO") {
      return erroAuditoriaInvalida({
        campo: "evento",
        valor: input.evento,
        motivo: "evento_nao_eh_de_locatario",
      });
    }

    const normalizado: RegistrarEventoAuditoriaLocatarioInput = {
      ...input,
      categoria: defEvento.categoria,
      usuarioId: input.usuarioId ?? null,
      erroCodigo: input.erroCodigo ?? null,
      erroMensagem: input.erroMensagem ?? null,
      entidadeNome: input.entidadeNome ?? null,
      entidadeTipo: input.entidadeTipo ?? null,
      entidadeId: input.entidadeId ?? null,
      origem: input.origem ?? "API",
      requisicaoId: input.requisicaoId ?? null,
      enderecoIp: input.enderecoIp ?? null,
      agenteUsuario: input.agenteUsuario ?? null,
      agenteTipo: input.agenteTipo ?? null,
      metadados: input.metadados ?? {},
    };

    const autorizacao = await autorizarAuditoria(deps, {
      operacao: "AUDITORIA_LOCATARIO_REGISTRAR",
      locatarioId: normalizado.locatarioId,
      usuarioId: normalizado.usuarioId,
      categoria: normalizado.categoria,
      evento: normalizado.evento,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const registrado =
      await deps.auditoriaLocatarioRepositorio.registrarEvento(normalizado);
    if (!registrado.ok) return registrado;

    return wrapOk<RegistrarEventoAuditoriaLocatarioOutput>({
      evento: registrado.value,
    });
  };
}