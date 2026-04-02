// apps/api/src/middlewares/superAdminGuard.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { buildContextFromRequest } from "../http/context";
import { sendHttpError } from "../http/serializarErroApp";
import { exigirSuperAdminHttp } from "../http/routeGuards";

/**
 * Middleware HTTP de autorização para operações de superadmin.
 *
 * Responsabilidades:
 * - assumir que a autenticação já ocorreu antes;
 * - construir o `ContextoExecucao` a partir da requisição;
 * - delegar a autorização à política HTTP centralizada;
 * - serializar erro HTTP padronizado quando necessário.
 *
 * Observação:
 * - este guard não deve conter regra própria de superadmin;
 * - a política concreta deve viver em `routeGuards.ts`.
 *
 * @param request Requisição Fastify atual.
 * @param reply Resposta Fastify.
 * @returns `void` quando autorizado ou resposta HTTP de erro.
 */
export async function superAdminGuard(request: FastifyRequest, reply: FastifyReply) {
  const ctxResult = await buildContextFromRequest(request);

  if (!ctxResult.ok) {
    return sendHttpError(reply, ctxResult.error);
  }

  const erroAuthz = exigirSuperAdminHttp(ctxResult.value);

  if (erroAuthz) {
    return sendHttpError(reply, erroAuthz);
  }
}
