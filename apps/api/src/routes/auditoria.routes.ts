// apps/api/src/routes/auditoria.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { listarAuditoriaPlataformaController, listarMinhaAuditoriaController } from "../modules/auditoria/auditoria.controller";
import type { ListarAuditoriaQueryDto } from "../modules/auditoria/auditoria.dto";

export const auditoriaRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ListarAuditoriaQueryDto }>(
    "/auditoria",
    { preHandler: [authGuard] },
    listarMinhaAuditoriaController,
  );

  app.get<{ Querystring: ListarAuditoriaQueryDto }>(
    "/plataforma/auditoria",
    { preHandler: [authGuard] },
    listarAuditoriaPlataformaController,
  );
};
