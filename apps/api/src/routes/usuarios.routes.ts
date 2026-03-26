// apps/api/src/routes/usuarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { listarUsuariosController } from "../modules/usuarios/usuarios.controller";

/**
 * 
 * @param app 
 */
export const usuariosRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/usuarios",
    {
      preHandler: [authGuard],
    },
    listarUsuariosController,
  );
};
