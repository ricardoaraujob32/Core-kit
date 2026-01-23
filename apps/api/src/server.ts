import Fastify, { type FastifyInstance } from "fastify";
import { buildContextFromRequest } from "./http/context";
import { registerHealthRoutes } from "./routes/health";
import { registerExemploProtegidoRoutes } from "./routes/exemplo-protegido";
import type { ContextoExecucao } from "@core-kit/core";
import { appError, type AppError } from "@core-kit/core";
import { mapAppErrorToHttpStatus, toHttpErrorBody } from "./http/errors";

function isAppError(e: unknown): e is AppError {
  if (!e || typeof e !== "object") return false;
  const anyE = e as { code?: unknown; message?: unknown };
  return typeof anyE.code === "string" && typeof anyE.message === "string";
}

declare module "fastify" {
  interface FastifyRequest {
    ctx: ContextoExecucao;
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({ logger: true });

  // 404 padronizado
app.setNotFoundHandler(async (_req, reply) => {
  const err = appError("NOT_FOUND", "Recurso não encontrado.");
  return reply.status(mapAppErrorToHttpStatus(err)).send(toHttpErrorBody(err));
});

// fallback global para erros fora do wrapper
app.setErrorHandler(async (error, _req, reply) => {
  const err = isAppError(error)
    ? error
    : appError("INTERNAL_ERROR", "Erro interno.", { reason: "fastify_error_handler" });

  return reply.status(mapAppErrorToHttpStatus(err)).send(toHttpErrorBody(err));
});

  // Hook simples: injeta ctx em toda request (DEV)
  app.addHook("preHandler", async (req) => {
    req.ctx = buildContextFromRequest(req);
  });

  await registerHealthRoutes(app);
  await registerExemploProtegidoRoutes(app);

  return app;
}
