// apps/api/src/modules/auditoria/auditarController.ts

import type { FastifyRequest } from "fastify";
import type { ContextoExecucao, RegistrarEventoAuditoriaPlataformaInput } from "@core-kit/core";
import { auditar } from "./auditoria.dispatcher.js";
import { criarContextoAuditoria } from "./auditoria.helpers.js";

type EventoControllerInput = Omit<
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

export async function auditarController(
  request: FastifyRequest,
  ctx: ContextoExecucao,
  evento: EventoControllerInput,
) {
  await auditar(criarContextoAuditoria(request, ctx), evento);
}