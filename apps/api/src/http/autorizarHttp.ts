// apps/api/src/http/autorizarHttp.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import type { ContextoExecucao, Permissao, ModuloCodigo } from "@core-kit/core";
import { autorizarOperacao } from "@core-kit/core";
import { buildContextFromRequest } from "./context";
import { sendHttpError } from "./serializarErroApp";
import { exigirMesmoLocatarioHttp, exigirSuperAdminHttp } from "./routeGuards";

/**
 * Política declarativa de autorização da borda HTTP.
 *
 * Campos opcionais:
 * - `permissao`: permissão RBAC exigida;
 * - `modulo`: módulo funcional que precisa estar habilitado;
 * - `exigeSuperadmin`: força a política provisória/canônica de superadmin;
 * - `locatarioIdAlvo`: exige que a operação aconteça no próprio locatário.
 */
export type PoliticaAutorizacaoHttp = {
  permissao?: Permissao;
  modulo?: ModuloCodigo;
  exigeSuperadmin?: boolean;
  locatarioIdAlvo?: string;
};

/**
 * Normaliza a coleção de módulos habilitados presentes no contexto.
 *
 * @param ctx Contexto já enriquecido.
 * @returns Códigos de módulo em maiúsculas.
 */
function normalizarModulosHabilitados(ctx: ContextoExecucao): string[] {
  if (!Array.isArray(ctx.modulosHabilitados)) {
    return [];
  }

  return ctx.modulosHabilitados.map((codigo) => String(codigo).toUpperCase());
}

/**
 * Verifica se o módulo exigido está habilitado no contexto.
 *
 * @param ctx Contexto atual.
 * @param modulo Código do módulo exigido.
 * @returns `true` quando o módulo estiver presente.
 */
function possuiModuloHabilitado(ctx: ContextoExecucao, modulo: ModuloCodigo): boolean {
  return normalizarModulosHabilitados(ctx).includes(String(modulo).trim().toUpperCase());
}

/**
 * Exige que um módulo esteja habilitado para o locatário atual.
 *
 * @param ctx Contexto atual.
 * @param modulo Código do módulo exigido.
 * @returns `null` quando autorizado ou erro HTTP-like quando negado.
 */
function exigirModuloHabilitadoHttp(ctx: ContextoExecucao, modulo: ModuloCodigo) : {
  codigo: "NAO_AUTORIZADO";
  mensagem: string;
  detalhes: Record<string, unknown>;
} | null {
  if (possuiModuloHabilitado(ctx, modulo)) {
    return null;
  }

  return {
    codigo: "NAO_AUTORIZADO",
    mensagem: "O módulo exigido não está habilitado para este locatário.",
    detalhes: {
      operacao: "http.autorizacao.moduloHabilitado",
      locatarioId: ctx.locatarioId,
      modulo,
    },
  };
}

/**
 * Resolve o contexto da requisição e aplica toda a política de autorização.
 *
 * Ordem de enforcement:
 * 1. contexto autenticado/autorizado;
 * 2. superadmin, quando exigido;
 * 3. escopo do próprio locatário, quando exigido;
 * 4. permissão RBAC, quando exigida;
 * 5. módulo habilitado, quando exigido.
 *
 * @param request Requisição Fastify autenticada.
 * @param reply Resposta Fastify.
 * @param politica Política declarativa de autorização.
 * @returns Contexto pronto para uso ou `null` quando a resposta de erro já foi enviada.
 */
export async function autorizarHttp(request: FastifyRequest, reply: FastifyReply, politica: PoliticaAutorizacaoHttp = {}): Promise<ContextoExecucao | null> {
  const ctxResult = await buildContextFromRequest(request);

  if (!ctxResult.ok) {
    sendHttpError(reply, ctxResult.error);
    return null;
  }

  const ctx = ctxResult.value;

  if (politica.exigeSuperadmin) {
    const erroSuperadmin = exigirSuperAdminHttp(ctx);
    if (erroSuperadmin) {
      sendHttpError(reply, erroSuperadmin);
      return null;
    }
  }

  if (politica.locatarioIdAlvo) {
    const erroMesmoLocatario = exigirMesmoLocatarioHttp(ctx, politica.locatarioIdAlvo);

    if (erroMesmoLocatario) {
      sendHttpError(reply, erroMesmoLocatario);
      return null;
    }
  }

  if (politica.permissao) {
    const autorizacao = autorizarOperacao({ ctx, permissao: politica.permissao });

    if (!autorizacao.ok) {
      sendHttpError(reply, autorizacao.error);
      return null;
    }
  }

  if (politica.modulo) {
    const erroModulo = exigirModuloHabilitadoHttp(ctx, politica.modulo);
    if (erroModulo) {
      sendHttpError(reply, erroModulo);
      return null;
    }
  }

  return ctx;
}
