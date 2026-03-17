import type { FastifyReply, FastifyRequest } from "fastify";
import type { ContextoExecucao } from "@core-kit/core";
import { sendHttpError } from "./serializarErroApp";
import type { BuildContextResult } from "./context";
import { aplicarGuardsHttp, type GuardOptions } from "./routeGuards";

type HandlerResult<T> =
  | { ok: true; value: T }
  | {
      ok: false;
      error: {
        codigo: string;
        mensagem: string;
        detalhes?: Record<string, unknown>;
      };
    };

type BuildContextFromRequest = (
  req: FastifyRequest,
) => Promise<BuildContextResult>;

type RouteHandler<TBody, TResult> = (args: {
  req: FastifyRequest<{ Body: TBody }>;
  reply: FastifyReply;
  ctx: ContextoExecucao;
}) => Promise<HandlerResult<TResult>> | HandlerResult<TResult>;

function isSuperAdmin(req: FastifyRequest) {
  const value = req.headers["x-superadmin"];
  return value === "true";
}

export function createWrapSuperAdminRoute(deps: {
  buildContextFromRequest: BuildContextFromRequest;
}) {
  function wrapSuperAdminRoute<TBody = unknown, TResult = unknown>(
    handler: RouteHandler<TBody, TResult>,
  ): (
    req: FastifyRequest<{ Body: TBody }>,
    reply: FastifyReply,
  ) => Promise<unknown>;

  function wrapSuperAdminRoute<TBody = unknown, TResult = unknown>(
    guards: GuardOptions,
    handler: RouteHandler<TBody, TResult>,
  ): (
    req: FastifyRequest<{ Body: TBody }>,
    reply: FastifyReply,
  ) => Promise<unknown>;

  function wrapSuperAdminRoute<TBody = unknown, TResult = unknown>(
    arg1: GuardOptions | RouteHandler<TBody, TResult>,
    arg2?: RouteHandler<TBody, TResult>,
  ) {
    const guards = typeof arg1 === "function" ? undefined : arg1;
    const handler = typeof arg1 === "function" ? arg1 : arg2;

    if (!handler) {
      throw new Error(
        "wrapSuperAdminRoute inválido: handler é obrigatório.",
      );
    }

    return async function wrapped(
      req: FastifyRequest<{ Body: TBody }>,
      reply: FastifyReply,
    ) {
      if (!isSuperAdmin(req)) {
        return sendHttpError(reply, {
          codigo: "NAO_AUTORIZADO",
          mensagem: "Acesso restrito a superadmin.",
        });
      }

      const ctxRes = await deps.buildContextFromRequest(req);

      if (!ctxRes.ok) {
        return sendHttpError(reply, ctxRes.error);
      }

      const guardRes = aplicarGuardsHttp(ctxRes.value, guards);

      if (!guardRes.ok) {
        return sendHttpError(reply, guardRes.error);
      }

      const result = await handler({
        req,
        reply,
        ctx: ctxRes.value,
      });

      if (!result.ok) {
        return sendHttpError(reply, result.error);
      }

      if (result.value === undefined) {
        return reply.status(204).send();
      }

      return reply.status(200).send(result.value);
    };
  }

  return wrapSuperAdminRoute;
}