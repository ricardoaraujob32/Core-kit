// apps/api/src/modules/auditoria/auditoria.helpers.ts

import { ContextoExecucao } from "@core-kit/core";
import { FastifyRequest } from "fastify";

// apps/api/src/modules/auditoria/auditoria.helpers.ts

/**
 * Categoria canônica dos eventos de auditoria.
 */
export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

/**
 * Parâmetros aceitos pelo publicador de auditoria do locatário.
 *
 * Observação:
 * - representa exclusivamente eventos destinados à tabela
 *   `auditoria_locatario`;
 * - não deve ser usado para auditoria de plataforma.
 */
export type TentarAuditarLocatarioParams = {
  locatarioId: string;
  usuarioId: string | null;
  evento: string;
  categoria: CategoriaAuditoria;
  sucesso: boolean;
  entidadeTipo?: string | null;
  entidadeNome?: string | null;
  entidadeId?: string | null;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
};

/**
 * Parâmetros aceitos pelo publicador de auditoria da plataforma.
 *
 * Observação:
 * - representa exclusivamente eventos destinados à tabela
 *   `auditoria_plataforma`;
 * - `locatarioAlvoId` deve ser preenchido quando a ação de plataforma
 *   afetar um locatário específico, inclusive em impersonação.
 */
export type TentarAuditarPlataformaParams = {
  usuarioId: string | null;
  evento: string;
  categoria: CategoriaAuditoria;
  sucesso: boolean;
  locatarioAlvoId?: string | null;
  entidadeTipo?: string | null;
  entidadeNome?: string | null;
  entidadeId?: string | null;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  origem?: string | null;
  requisicaoId?: string | null;
  enderecoIp?: string | null;
  agenteUsuario?: string | null;
  agenteTipo?: string | null;
  metadados?: Record<string, unknown>;
};

/**
 * Publica um evento na auditoria do locatário em modo best-effort.
 *
 * Observação:
 * - falhas de auditoria não quebram o fluxo principal;
 * - o contexto SQL é aberto antes da escrita para preservar coerência com RLS.
 *
 * @param params Dados do evento auditado.
 * @returns `Promise<void>`.
 */
export async function tentarAuditarLocatario(params: TentarAuditarLocatarioParams): Promise<void> {
  // TODO: implement audit locatario
  console.log("Audit locatario event:", params.evento);
}

export async function tentarAuditarPlataforma(params: TentarAuditarPlataformaParams): Promise<void> {
  // TODO: implement audit plataforma
  console.log("Audit plataforma event:", params.evento);
}

/**
 * 
 * @param request 
 * @param ctx 
 * @param extras 
 * @returns 
 */
export function criarContextoAuditoria(request: FastifyRequest, ctx: ContextoExecucao,
  extras?: {
    isSuperadmin?: boolean;
    isImpersonando?: boolean;
    locatarioAlvoId?: string | null;
    agenteTipo?: string | null;
    origem?: string | null;
  },
) {
  return {
    usuarioId: ctx.usuarioId ?? null,
    locatarioId: ctx.locatarioId ?? null,
    isSuperadmin: extras?.isSuperadmin ?? false,
    isImpersonando: extras?.isImpersonando ?? false,
    locatarioAlvoId: extras?.locatarioAlvoId ?? null,
    agenteTipo: extras?.agenteTipo ?? null,
    origem: extras?.origem ?? "API",
    requisicaoId: request.requestIdApp ?? null,
    enderecoIp: request.ip ?? null,
    agenteUsuario:
      typeof request.headers["user-agent"] === "string"
        ? request.headers["user-agent"]
        : null,
  };
}