// apps/api/src/routes/fornecedores.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { atualizarFornecedorController, criarFornecedorController, excluirFornecedorController, listarFornecedoresController, obterFornecedorController } from "../modules/fornecedores/fornecedores.controller.js";
import { AtualizarFornecedorBodyDto, CriarFornecedorBodyDto, FornecedorIdParamsDto } from "../modules/fornecedores/fornecedores.dto.js";

export const fornecedoresRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/fornecedores",
    { preHandler: [authGuard] },
    listarFornecedoresController,
  );

  app.get<{ Params: FornecedorIdParamsDto }>(
    "/fornecedores/:id",
    { preHandler: [authGuard] },
    obterFornecedorController,
  );

  app.post<{ Body: CriarFornecedorBodyDto }>(
    "/fornecedores",
    { preHandler: [authGuard] },
    criarFornecedorController,
  );

  app.patch<{ Params: FornecedorIdParamsDto; Body: AtualizarFornecedorBodyDto }>(
    "/fornecedores/:id",
    { preHandler: [authGuard] },
    atualizarFornecedorController,
  );

  app.delete<{ Params: FornecedorIdParamsDto }>(
    "/fornecedores/:id",
    { preHandler: [authGuard] },
    excluirFornecedorController,
  );
};