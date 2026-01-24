import Fastify, { type FastifyInstance } from "fastify";
import { buildContextFromRequest } from "./http/context";
import { registerHealthRoutes } from "./routes/health";
import { registerExemploProtegidoRoutes } from "./routes/exemplo-protegido";

/**
 *
 * @returns Promise<FastifyInstance>
 */

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({ logger: true });

  // injeta ctx em toda request (DEV)
  app.addHook("preHandler", async (req) => {
    req.ctx = buildContextFromRequest(req);
  });

  await registerHealthRoutes(app);
  await registerExemploProtegidoRoutes(app);

  return app;
}
