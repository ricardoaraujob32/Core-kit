import Fastify, { type FastifyInstance } from "fastify";
import { buildContextFromRequest } from "./http/context";
import { registerHealthRoutes } from "./routes/health";
import { registerExemploProtegidoRoutes } from "./routes/exemplo-protegido";
import type { ContextoExecucao } from "@core-kit/core";

declare module "fastify" {
  interface FastifyRequest {
    ctx: ContextoExecucao;
  }
}

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({ logger: true });

  // Hook simples: injeta ctx em toda request (DEV)
  app.addHook("preHandler", async (req) => {
    req.ctx = buildContextFromRequest(req);
  });

  await registerHealthRoutes(app);
  await registerExemploProtegidoRoutes(app);

  return app;
}
