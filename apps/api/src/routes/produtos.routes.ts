// apps/api/src/routes/produtos.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { atualizarProdutoController, criarProdutoController, excluirProdutoController, listarProdutosController, obterProdutoController } from "../modules/produtos/produtos.controller";
import { AtualizarProdutoBodyDto, CriarProdutoBodyDto, ProdutoIdParamsDto } from "../modules/produtos/produtos.dto";

export const produtosRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/produtos",
    { preHandler: [authGuard] },
    listarProdutosController,
  );

  app.get<{ Params: ProdutoIdParamsDto }>(
    "/produtos/:id",
    { preHandler: [authGuard] },
    obterProdutoController,
  );

  app.post<{ Body: CriarProdutoBodyDto }>(
    "/produtos",
    { preHandler: [authGuard] },
    criarProdutoController,
  );

  app.patch<{ Params: ProdutoIdParamsDto; Body: AtualizarProdutoBodyDto }>(
    "/produtos/:id",
    { preHandler: [authGuard] },
    atualizarProdutoController,
  );

  app.delete<{ Params: ProdutoIdParamsDto }>(
    "/produtos/:id",
    { preHandler: [authGuard] },
    excluirProdutoController,
  );
};