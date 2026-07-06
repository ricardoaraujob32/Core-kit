// apps/api/src/modules/auditoria/auditoria.dispatcher.ts

import { createFnRegistrarEventoAuditoriaLocatario, createFnRegistrarEventoAuditoriaPlataforma, resolverEventoAuditoria } from "@core-kit/core";
import type { RegistrarEventoAuditoriaLocatarioInput, RegistrarEventoAuditoriaPlataformaInput } from "@core-kit/core";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createAuditoriaLocatarioRepositorio } from "../../infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.js";
import { createAuditoriaPlataformaRepositorio } from "../../infra/prisma/auditoria/auditoriaInternaRepositorioPrisma.js";
import { type ContextoAuditoriaHttp, montarEventoAuditoria } from "./auditoria.helpers.js";

const registrarEventoAuditoriaLocatario = createFnRegistrarEventoAuditoriaLocatario({
    auditoriaLocatarioRepositorio: createAuditoriaLocatarioRepositorio(clientePrisma),
  });

const registrarEventoAuditoriaPlataforma = createFnRegistrarEventoAuditoriaPlataforma({
    auditoriaPlataformaRepositorio: createAuditoriaPlataformaRepositorio(clientePrisma),
  });

type EventoAuditoriaControllerInput = Omit<RegistrarEventoAuditoriaLocatarioInput & RegistrarEventoAuditoriaPlataformaInput,
  | "categoria"
  | "locatarioId"
  | "usuarioId"
  | "superadminUsuarioId"
  | "locatarioAlvoId"
  | "origem"
  | "requisicaoId"
  | "enderecoIp"
  | "agenteUsuario"
  | "agenteTipo"
>;

/**
 * Dispatcher canônico de auditoria.
 *
 * Responsabilidades:
 * - montar o input HTTP de auditoria;
 * - consultar o catálogo canônico do Core;
 * - enviar eventos de locatário para a trilha de locatário;
 * - enviar eventos de plataforma para a trilha de plataforma.
 *
 * O dispatcher não deve assumir que todo evento é de plataforma.
 */
export async function auditar(contexto: ContextoAuditoriaHttp, evento: EventoAuditoriaControllerInput) {
  const input = montarEventoAuditoria(contexto, evento);

  let definicaoEvento: ReturnType<typeof resolverEventoAuditoria>;

  try {
    definicaoEvento = resolverEventoAuditoria(input.evento);
  } catch (error) {
    console.error("[auditoria.falha][evento-nao-mapeado]", {
      evento: input.evento,
      erro: error,
    });

    return {
      ok: false as const,
      error,
    };
  }

  const resultado =
    definicaoEvento.destino === "LOCATARIO"
      ? await registrarEventoAuditoriaLocatario(
          input as RegistrarEventoAuditoriaLocatarioInput,
        )
      : await registrarEventoAuditoriaPlataforma(
          input as RegistrarEventoAuditoriaPlataformaInput,
        );

  if (!resultado.ok) {
    console.error("[auditoria.falha]", {
      evento: input.evento,
      destino: definicaoEvento.destino,
      erro: resultado.error,
    });
  }

  return resultado;
}