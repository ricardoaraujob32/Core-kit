// apps/api/src/routes/assinaturaModulos.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { desvincularModuloDaMinhaAssinaturaController, listarMeusModulosAssinaturaController, vincularModuloNaMinhaAssinaturaController } from "../modules/assinaturas/assinaturaModulos.controller";
import { ModuloIdParamsDto, VincularModuloAssinaturaBodyDto } from "../modules/assinaturas/assinaturaModulos.dto";

/**
 * 
 * @param app 
 */
export const assinaturaModulosRoutes: FastifyPluginAsync = async (app) => {
  /**
   * 
   */
  app.get(
    "/me/assinatura/modulos",
    { preHandler: authGuard },
    listarMeusModulosAssinaturaController,
  );

  /**
   * 
   */
  app.post<{ Body: VincularModuloAssinaturaBodyDto }>(
    "/me/assinatura/modulos",
    { preHandler: authGuard },
    vincularModuloNaMinhaAssinaturaController,
  );

  /**
   * 
   */
  app.delete<{ Params: ModuloIdParamsDto }>(
    "/me/assinatura/modulos/:moduloId",
    { preHandler: authGuard },
    desvincularModuloDaMinhaAssinaturaController,
  );
};
