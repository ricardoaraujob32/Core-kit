// apps/api/src/modules/auditoria/auditoria.helpers.ts

import { ContextoPlataformaAutorizado } from "@core-kit/api/http/autorizarPlataformaHttp";
import { ContextoExecucao, RegistrarEventoAuditoriaPlataformaInput } from "@core-kit/core";
import { FastifyRequest } from "fastify";

/**
 * Categoria canônica dos eventos de auditoria.
 */
export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

export type ContextoAuditoriaHttp = {
  locatarioId: string | null;
  usuarioId: string | null;
  origem: string;
  requisicaoId: string | null;
  enderecoIp: string | null;
  agenteUsuario: string | null;
  agenteTipo: string | null;
};

function extrairRequisicaoId(request: FastifyRequest): string | null {
  const header =
    request.headers["x-request-id"] ??
    request.headers["x-correlation-id"];

  if (Array.isArray(header)) return header[0] ?? null;
  return typeof header === "string" ? header : null;
}

export function criarContextoAuditoria(request: FastifyRequest, ctx: ContextoExecucao): ContextoAuditoriaHttp {
  return {
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId ?? null,
    origem: "API",
    requisicaoId: extrairRequisicaoId(request),
    enderecoIp: request.ip ?? null,
    agenteUsuario: request.headers["user-agent"] ?? null,
    agenteTipo: ctx.usuarioId ? "USUARIO_AUTENTICADO" : "ANONIMO",
  };
}

export function criarContextoAuditoriaPlataforma(request: FastifyRequest, plataforma: ContextoPlataformaAutorizado, extras: { locatarioAlvoId?: string | null } = {},
): Pick<RegistrarEventoAuditoriaPlataformaInput,
  | "superadminUsuarioId"
  | "locatarioAlvoId"
  | "origem"
  | "requisicaoId"
  | "enderecoIp"
  | "agenteUsuario"
  | "agenteTipo"
> {
  return {
    superadminUsuarioId: plataforma.usuarioId,
    locatarioAlvoId: extras.locatarioAlvoId ?? null,
    origem: "API",
    requisicaoId: request.id,
    enderecoIp: request.ip,
    agenteUsuario: request.headers["user-agent"] ?? null,
    agenteTipo: "USUARIO_PLATAFORMA",
  };
}

export function montarEventoAuditoria(
  contexto: ContextoAuditoriaHttp,
  evento: Omit<
    RegistrarEventoAuditoriaPlataformaInput,
    | "escopo"
    | "locatarioId"
    | "usuarioId"
    | "origem"
    | "requisicaoId"
    | "enderecoIp"
    | "agenteUsuario"
    | "agenteTipo"
  >,
): RegistrarEventoAuditoriaPlataformaInput {
  return {
    ...evento,
    locatarioAlvoId: contexto.locatarioId,
    superadminUsuarioId: contexto.usuarioId,
    origem: contexto.origem,
    requisicaoId: contexto.requisicaoId,
    enderecoIp: contexto.enderecoIp,
    agenteUsuario: contexto.agenteUsuario,
    agenteTipo: contexto.agenteTipo,
  };
}