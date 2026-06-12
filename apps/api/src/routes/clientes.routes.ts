// apps/api/src/routes/clientes.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { atualizarClienteController, criarClienteController, excluirClienteController, listarClientesController, obterClienteController } from "../modules/clientes/clientes.controller.js";
import { AtualizarClienteBodyDto, ClienteIdParamsDto, CriarClienteBodyDto } from "../modules/clientes/clientes.dto.js";

export const clientesRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/clientes",
    { preHandler: [authGuard] },
    listarClientesController,
  );

  app.get<{ Params: ClienteIdParamsDto }>(
    "/clientes/:id",
    { preHandler: [authGuard] },
    obterClienteController,
  );

  app.post<{ Body: CriarClienteBodyDto }>(
    "/clientes",
    { preHandler: [authGuard] },
    criarClienteController,
  );

  app.patch<{ Params: ClienteIdParamsDto; Body: AtualizarClienteBodyDto }>(
    "/clientes/:id",
    { preHandler: [authGuard] },
    atualizarClienteController,
  );

  app.delete<{ Params: ClienteIdParamsDto }>(
    "/clientes/:id",
    { preHandler: [authGuard] },
    excluirClienteController,
  );
};