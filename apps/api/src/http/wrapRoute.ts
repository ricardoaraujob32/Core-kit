import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppError, ContextoExecucao, Result } from "@core-kit/core";
import { appError } from "@core-kit/core";

import { buildContextFromRequest } from "./context";
import { mapAppErrorToHttpStatus, toHttpErrorBody } from "./errors";

function isAppError(e: unknown): e is AppError {
  if (!e || typeof e !== "object") return false;
  const anyE = e as { code?: unknown; message?: unknown };
  return typeof anyE.code === "string" && typeof anyE.message === "string";
}

/**
 * Função de rota “pura” (Abordagem A):
 * recebe ctx e req, devolve Result.
 */
export type RouteFn<TOut> = (
  ctx: ContextoExecucao,
  req: FastifyRequest,
) => Promise<Result<TOut, AppError>> | Result<TOut, AppError>;

/**
 * Wrapper Fastify: converte Result -> HTTP.
 * - sucesso: 200 + body
 * - erro: status mapeado + { error: ... }
 */
export function wrapRoute<TOut>(fn: RouteFn<TOut>) {
  return async function handler(req: FastifyRequest, reply: FastifyReply) {
    // Se já existe ctx (via hook), reaproveita. Senão, constrói.
    const ctx: ContextoExecucao =
      (req as unknown as { ctx?: ContextoExecucao }).ctx ?? buildContextFromRequest(req);

    try {
      const result = await fn(ctx, req);

      if (result.ok) {
        // padrão: ok(undefined) => 204 (sem body)
        if (result.value === undefined) {
          return reply.status(204).send();
        }
          return reply.status(200).send(result.value);
      }


      const status = mapAppErrorToHttpStatus(result.error);
      return reply.status(status).send(toHttpErrorBody(result.error));
    } catch (e) {
      const err = isAppError(e)
        ? e
        : appError("INTERNAL_ERROR", "Erro interno.", {
            reason: "unhandled_exception",
          });

      const status = mapAppErrorToHttpStatus(err);
      return reply.status(status).send(toHttpErrorBody(err));
    }
  };
}
