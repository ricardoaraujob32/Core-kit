// apps/api/src/http/wrapRoute.ts
//
// Finalidade:
// - Implementar o Wrapper HTTP (Abordagem A) para rotas Fastify.
// - Construir/reusar o Contexto de Execução do Core Kit.
// - Converter Result<T, AppError> → resposta HTTP consistente.
// - Normalizar erros (ex.: FORBIDDEN) e estabilizar JSON (stripUndefined).
//
// Contrato de resposta:
// - Sucesso:
//   - Se o handler retornar `ok(undefined)` → HTTP 204 (sem body).
//   - Caso contrário → HTTP 200 + { data: <valor> }
// - Erro:
//   - HTTP status coerente com AppErrorCode + { error: { code, message, details? } }

import type { FastifyReply, FastifyRequest } from "fastify";
import type { AppError, ContextoExecucao, Result } from "@core-kit/core";
import { appError } from "@core-kit/core";
import { buildContextFromRequest } from "./context";
import {
  mapAppErrorToHttpStatus,
  normalizeForbiddenMessage,
  stripUndefined,
  toHttpErrorBody,
} from "./errors";

function isAppError(valor: unknown): valor is AppError {
  if (!valor || typeof valor !== "object") return false;
  const anyValor = valor as { code?: unknown; message?: unknown };
  return typeof anyValor.code === "string" && typeof anyValor.message === "string";
}

/**
 * Função de rota “pura” (Abordagem A):
 * - recebe ctx e req
 * - devolve Result (sem depender de Fastify)
 */
export type RouteFn<TSaida> = (
  ctx: ContextoExecucao,
  req: FastifyRequest,
) => Promise<Result<TSaida, AppError>> | Result<TSaida, AppError>;

type HttpSuccessBody<T> = { data: T };
type HttpErrorBody = { error: ReturnType<typeof toHttpErrorBody> };

/**
 * Wrapper Fastify:
 * - constrói/reusa ctx
 * - converte Result -> HTTP (status + body)
 * - normaliza mensagens/payload (ex.: FORBIDDEN + stripUndefined)
 * - captura throw inesperado e converte para INTERNAL (genérico)
 */
export function wrapRoute<TSaida>(fn: RouteFn<TSaida>) {
  return async function handler(req: FastifyRequest, reply: FastifyReply) {
    const ctx: ContextoExecucao =
      (req as unknown as { ctx?: ContextoExecucao }).ctx ?? buildContextFromRequest(req);

    try {
      const resultado = await fn(ctx, req);

      if (resultado.ok) {
        // padrão: ok(undefined) => 204 (sem body)
        if (resultado.value === undefined) {
          return reply.status(204).send();
        }

        const corpo: HttpSuccessBody<TSaida> = { data: resultado.value };
        return reply.status(200).send(stripUndefined(corpo));
      }

      const erroNormalizado = normalizeForbiddenMessage(resultado.error);
      const status = mapAppErrorToHttpStatus(erroNormalizado.code);

      const corpo: HttpErrorBody = { error: toHttpErrorBody(erroNormalizado) };
      return reply.status(status).send(stripUndefined(corpo));
    } catch (e) {
      // Não vazar detalhes: unknown -> INTERNAL genérico
      const erroDominio = isAppError(e) ? e : appError("INTERNAL_ERROR", "Erro interno.");
      const erroNormalizado = normalizeForbiddenMessage(erroDominio);
      const status = mapAppErrorToHttpStatus(erroNormalizado.code);

      const corpo: HttpErrorBody = { error: toHttpErrorBody(erroNormalizado) };
      return reply.status(status).send(stripUndefined(corpo));
    }
  };
}
