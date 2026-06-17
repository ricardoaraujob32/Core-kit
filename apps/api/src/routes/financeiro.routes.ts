// apps/api/src/routes/financeiro.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { listarContasPagarController, listarContasReceberController, obterResumoFinanceiroController } from "../modules/financeiro/financeiro.controller.js";
import type { FinanceiroQueryDto } from "../modules/financeiro/financeiro.dto.js";

export const financeiroRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/financeiro/resumo",
    { preHandler: [authGuard] },
    obterResumoFinanceiroController,
  );

  app.get<{ Querystring: FinanceiroQueryDto }>(
    "/financeiro/contas-receber",
    { preHandler: [authGuard] },
    listarContasReceberController,
  );

  app.get<{ Querystring: FinanceiroQueryDto }>(
    "/financeiro/contas-pagar",
    { preHandler: [authGuard] },
    listarContasPagarController,
  );
};
