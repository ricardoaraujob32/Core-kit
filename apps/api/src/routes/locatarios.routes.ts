// apps/api/src/routes/locatarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { listarLocatariosSuperAdminController, obterLocatarioSuperAdminController, obterMeuLocatarioController } from "../modules/locatarios/locatarios.controller";

/**
 * 
 * @param app 
 */
export const locatariosRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Fluxo do próprio locatário:
   * admin do tenant consulta somente o próprio locatário.
   */
  app.get<{ Params: { id: string } }>(
    "/locatarios/:id",
    { preHandler: [authGuard] },
    obterMeuLocatarioController,
  );

  /**
   * Fluxo de superadmin:
   * listagem global de locatários.
   */
  app.get(
    "/plataforma/locatarios",
    { preHandler: [authGuard] },
    listarLocatariosSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * consulta global de locatário por id.
   */
  app.get<{ Params: { id: string } }>(
    "/plataforma/locatarios/:id",
    { preHandler: [authGuard] },
    obterLocatarioSuperAdminController,
  );
};
