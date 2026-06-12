// packages/core/src/auditoria/usecases/registrarEventoAuditoriaPlataforma.ts

import { wrapOk } from "../../kernel/index.js";
import { erroAuditoriaInvalida } from "../erros.js";
import type { AuditoriaPlataformaRepositorio } from "../portasRepositorio.js";
import { resolverEventoAuditoria } from "../resolverEventoAuditoria.js";
import type { RegistrarEventoAuditoriaPlataformaInput, RegistrarEventoAuditoriaPlataformaOutput, RegistrarEventoAuditoriaPlataformaResult } from "../tipos.js";
import { autorizarAuditoria, type PoliticaSegurancaAuditoriaPorta } from "../politicas.js";
import { validarRegistrarEventoAuditoriaPlataformaInput } from "../validadores.js";

/**
 * 
 * @param deps 
 * @returns 
 */
export function createFnRegistrarEventoAuditoriaPlataforma(deps: {
  auditoriaPlataformaRepositorio: AuditoriaPlataformaRepositorio;
  politicaSeguranca?: PoliticaSegurancaAuditoriaPorta;
}) {
  /**
   * 
   */
  return async function registrarEventoAuditoriaPlataforma(input: RegistrarEventoAuditoriaPlataformaInput): RegistrarEventoAuditoriaPlataformaResult {
    const validacao = validarRegistrarEventoAuditoriaPlataformaInput(input);
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

    if (defEvento.destino !== "PLATAFORMA") {
      return erroAuditoriaInvalida({
        campo: "evento",
        valor: input.evento,
        motivo: "evento_nao_eh_de_plataforma",
      });
    }

    if (defEvento.exigeLocatarioAlvo && !input.locatarioAlvoId) {
      return erroAuditoriaInvalida({
        campo: "locatarioAlvoId",
        motivo: "evento_exige_locatario_alvo",
        evento: input.evento,
      });
    }

    const normalizado: RegistrarEventoAuditoriaPlataformaInput = {
      ...input,
      categoria: defEvento.categoria,
      superadminUsuarioId: input.superadminUsuarioId ?? null,
      locatarioAlvoId: input.locatarioAlvoId ?? null,
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
      operacao: "AUDITORIA_PLATAFORMA_REGISTRAR",
      superadminUsuarioId: normalizado.superadminUsuarioId,
      locatarioAlvoId: normalizado.locatarioAlvoId,
      categoria: normalizado.categoria,
      evento: normalizado.evento,
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    const registrado =
      await deps.auditoriaPlataformaRepositorio.registrarEvento(normalizado);
    if (!registrado.ok) return registrado;

    return wrapOk<RegistrarEventoAuditoriaPlataformaOutput>({
      evento: registrado.value,
    });
  };
}