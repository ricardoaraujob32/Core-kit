// apps/api/src/routes/dashboard.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { obterDashboardResumoController } from "../modules/dashboard/dashboard.controller.js";

export const dashboardRoutes: FastifyPluginAsync = async (app) => {
  app.get("/dashboard/resumo", obterDashboardResumoController);
};
