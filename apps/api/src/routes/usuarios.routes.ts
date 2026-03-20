// apps/api/src/routes/usuarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { tenantContextGuard } from "../middlewares/tenantContext";
import { listarUsuariosController } from "../modules/usuarios/usuarios.controller";

export const usuariosRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/usuarios",
    {
      preHandler: [authGuard, tenantContextGuard],
    },
    listarUsuariosController,
  );
};