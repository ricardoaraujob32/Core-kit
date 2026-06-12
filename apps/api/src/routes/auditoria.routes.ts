// apps/api/src/routes/auditoria.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { listarAuditoriaPlataformaController, listarMinhaAuditoriaController } from "../modules/auditoria/auditoria.controller.js";
import type { ListarAuditoriaQueryDto } from "../modules/auditoria/auditoria.dto.js";

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
