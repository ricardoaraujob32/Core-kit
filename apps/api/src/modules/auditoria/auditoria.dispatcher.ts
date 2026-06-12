// apps/api/src/modules/auditoria/auditoria.dispatcher.ts

import { createFnRegistrarEventoAuditoriaPlataforma, RegistrarEventoAuditoriaPlataformaInput, resolverEventoAuditoria } from "@core-kit/core";
import { ContextoAuditoriaHttp, montarEventoAuditoria } from "./auditoria.helpers.js";
import { clientePrisma } from "@core-kit/api/infra/prisma/client";
import { createAuditoriaPlataformaRepositorio } from "@core-kit/api/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma";

const registrarEventoAuditoriaPlataforma = createFnRegistrarEventoAuditoriaPlataforma({
  auditoriaPlataformaRepositorio: createAuditoriaPlataformaRepositorio(clientePrisma),
});

type EventoAuditoriaControllerInput = Omit<
  RegistrarEventoAuditoriaPlataformaInput,
  | "escopo"
  | "locatarioId"
  | "usuarioId"
  | "origem"
  | "requisicaoId"
  | "enderecoIp"
  | "agenteUsuario"
  | "agenteTipo"
>;

export async function auditar(contexto: ContextoAuditoriaHttp, evento: EventoAuditoriaControllerInput) {
  const input = montarEventoAuditoria(contexto, evento);

  const resultado = await registrarEventoAuditoriaPlataforma(input);

  if (!resultado.ok) {
    console.error("[auditoria.falha]", {
      evento: input.evento,
      erro: resultado.error,
    });
  }

  return resultado;
}