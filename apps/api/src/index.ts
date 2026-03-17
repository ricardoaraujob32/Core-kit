// apps/api/src/index.ts

import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./health.routes";
import { authRoutes } from "./auth.routes";
import { locatariosRoutes } from "./locatarios.routes";
import { usuariosRoutes } from "./usuarios.routes";

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(locatariosRoutes, { prefix: "/api" });
  await app.register(usuariosRoutes, { prefix: "/api" });
};
