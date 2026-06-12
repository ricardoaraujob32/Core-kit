// apps/api/src/routes/vendas.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { adicionarItemTransacaoController, atualizarItemTransacaoController, cancelarTransacaoController, concluirTransacaoController, confirmarTransacaoController, criarCompraController, criarVendaController, listarTransacoesController, obterTransacaoController, removerItemTransacaoController } from "../modules/vendas/vendas.controller.js";
import { AdicionarItemTransacaoBodyDto, AtualizarItemTransacaoBodyDto, CancelarTransacaoBodyDto, CriarCompraBodyDto, CriarVendaBodyDto, ItemTransacaoIdParamsDto, 
  TransacaoIdParamsDto } from "../modules/vendas/vendas.dto.js";

export const vendasRoutes: FastifyPluginAsync = async (app) => {
  app.get(
    "/transacoes",
    { preHandler: [authGuard] },
    listarTransacoesController,
  );

  app.get<{ Params: TransacaoIdParamsDto }>(
    "/transacoes/:id",
    { preHandler: [authGuard] },
    obterTransacaoController,
  );

  app.post<{ Body: CriarVendaBodyDto }>(
    "/vendas",
    { preHandler: [authGuard] },
    criarVendaController,
  );

  app.post<{ Body: CriarCompraBodyDto }>(
    "/compras",
    { preHandler: [authGuard] },
    criarCompraController,
  );

  app.post<{ Params: TransacaoIdParamsDto; Body: AdicionarItemTransacaoBodyDto }>(
    "/transacoes/:id/itens",
    { preHandler: [authGuard] },
    adicionarItemTransacaoController,
  );

  app.patch<{ Params: ItemTransacaoIdParamsDto; Body: AtualizarItemTransacaoBodyDto }>(
    "/transacoes/:id/itens/:itemId",
    { preHandler: [authGuard] },
    atualizarItemTransacaoController,
  );

  app.delete<{ Params: ItemTransacaoIdParamsDto }>(
    "/transacoes/:id/itens/:itemId",
    { preHandler: [authGuard] },
    removerItemTransacaoController,
  );

  app.post<{ Params: TransacaoIdParamsDto }>(
    "/transacoes/:id/confirmar",
    { preHandler: [authGuard] },
    confirmarTransacaoController,
  );

  app.post<{ Params: TransacaoIdParamsDto; Body: CancelarTransacaoBodyDto }>(
    "/transacoes/:id/cancelar",
    { preHandler: [authGuard] },
    cancelarTransacaoController,
  );

  app.post<{ Params: TransacaoIdParamsDto }>(
    "/transacoes/:id/concluir",
    { preHandler: [authGuard] },
    concluirTransacaoController,
  );
};