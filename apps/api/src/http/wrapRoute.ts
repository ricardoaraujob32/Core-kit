// apps/api/src/http/wrapRoute.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppError, ContextoExecucao, Result } from "@core-kit/core";
import { appError } from "@core-kit/core";
import { buildContextFromRequest } from "./context";
import { normalizeForbiddenMessage, stripUndefined, mapAppErrorToHttpStatus } from "./errors";

function isAppError(e: unknown): e is AppError {
  if (!e || typeof e !== "object") return false;
  const anyE = e as { code?: unknown; message?: unknown };
  return typeof anyE.code === "string" && typeof anyE.message === "string";
}

/**
 * Função de rota “pura” (Abordagem A):
 * - recebe ctx e req
 * - devolve Result (sem depender de Fastify)
 */
export type RouteFn<TOut> = (
  ctx: ContextoExecucao,
  req: FastifyRequest,
) => Promise<Result<TOut, AppError>> | Result<TOut, AppError>;

/**
 * Wrapper Fastify:
 * - constrói/reusa ctx
 * - converte Result -> HTTP (status + body)
 * - normaliza mensagens/payload (ex.: FORBIDDEN + stripUndefined)
 * - captura throw inesperado e converte para INTERNAL
 */
export function wrapRoute<TOut>(fn: RouteFn<TOut>) {
  return async function handler(req: FastifyRequest, reply: FastifyReply) {
    const ctx: ContextoExecucao =
      (req as unknown as { ctx?: ContextoExecucao }).ctx ?? buildContextFromRequest(req);

    try {
      const result = await fn(ctx, req);

      if (result.ok) {
        // padrão: ok(undefined) => 204 (sem body)
        if (result.value === undefined) {
          return reply.status(204).send();
        }
        // remove undefined para manter JSON previsível
        return reply.status(200).send(stripUndefined(result.value));
      }

      const err = normalizeForbiddenMessage(result.error);
      const status = mapAppErrorToHttpStatus(err.code);

      return reply.status(status).send(
        stripUndefined({
          error: err,
        }),
      );
    } catch (e) {
      // Não vazar detalhes: unknown -> INTERNAL genérico
      const err = normalizeForbiddenMessage(
        isAppError(e) ? e : appError("INTERNAL_ERROR", "Erro interno."),
      );
      // const err = unexpectedToInternalError(e); // possível refatoração sugerida pelo ChatGPT

      const status = mapAppErrorToHttpStatus(err.code);

      return reply.status(status).send(
        stripUndefined({
          error: err,
        }),
      );
    }
  };
}

