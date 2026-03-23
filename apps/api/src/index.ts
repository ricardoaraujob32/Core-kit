// apps/api/src/index.ts

import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";
import { locatariosRoutes } from "./routes/locatarios.routes";
import { usuariosRoutes } from "./routes/usuarios.routes";

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(locatariosRoutes, { prefix: "/api" });
  await app.register(usuariosRoutes, { prefix: "/api" });
};
