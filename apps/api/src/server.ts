import Fastify, { type FastifyInstance } from "fastify";
import { buildContextFromRequest } from "./http/context";
import { registerHealthRoutes } from "./routes/health";
import { registerExemploProtegidoRoutes } from "./routes/exemplo-protegido";
import { registerUsuariosRoutes } from "./routes/usuarios";
import { createDeps } from "./di";

/**
 *
 * @returns Promise<FastifyInstance>
 */

export async function buildServer(): Promise<FastifyInstance> {
  const app: FastifyInstance = Fastify({ logger: true });
  const deps = createDeps();

  // injeta ctx em toda request (DEV)
  app.addHook("preHandler", async (req) => {
    req.ctx = buildContextFromRequest(req);
  });

  await registerHealthRoutes(app);
  await registerExemploProtegidoRoutes(app);
  await registerUsuariosRoutes(app, deps);

  return app;
}
