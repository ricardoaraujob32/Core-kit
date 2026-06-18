// apps/api/src/routes/ordensServico.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { aguardarOrdemServicoController, atualizarOrdemServicoController, cancelarOrdemServicoController, concluirOrdemServicoController, criarOrdemServicoController,
  gerarVendaDaOrdemServicoController, iniciarOrdemServicoController, listarOrdensServicoController, obterOrdemServicoController
} from "../modules/ordensServico/ordensServico.controller.js";
import { AtualizarOrdemServicoBodyDto, CriarOrdemServicoBodyDto, GerarVendaOrdemServicoBodyDto, ListarOrdensServicoQueryDto, OrdemServicoIdParamsDto } from "../modules/ordensServico/ordensServico.dto.js";

export const ordensServicoRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Querystring: ListarOrdensServicoQueryDto }>(
    "/ordens-servico",
    { preHandler: [authGuard] },
    listarOrdensServicoController,
  );

  app.post<{ Body: CriarOrdemServicoBodyDto }>(
    "/ordens-servico",
    { preHandler: [authGuard] },
    criarOrdemServicoController,
  );

  app.get<{ Params: OrdemServicoIdParamsDto }>(
    "/ordens-servico/:ordemServicoId",
    { preHandler: [authGuard] },
    obterOrdemServicoController,
  );

  app.patch<{ Params: OrdemServicoIdParamsDto; Body: AtualizarOrdemServicoBodyDto }>(
    "/ordens-servico/:ordemServicoId",
    { preHandler: [authGuard] },
    atualizarOrdemServicoController,
  );

  app.post<{ Params: OrdemServicoIdParamsDto }>(
    "/ordens-servico/:ordemServicoId/iniciar",
    { preHandler: [authGuard] },
    iniciarOrdemServicoController,
  );

  app.post<{ Params: OrdemServicoIdParamsDto }>(
    "/ordens-servico/:ordemServicoId/aguardar",
    { preHandler: [authGuard] },
    aguardarOrdemServicoController,
  );

  app.post<{ Params: OrdemServicoIdParamsDto }>(
    "/ordens-servico/:ordemServicoId/concluir",
    { preHandler: [authGuard] },
    concluirOrdemServicoController,
  );

  app.post<{ Params: OrdemServicoIdParamsDto }>(
    "/ordens-servico/:ordemServicoId/cancelar",
    { preHandler: [authGuard] },
    cancelarOrdemServicoController,
  );

  app.post<{ Params: OrdemServicoIdParamsDto; Body: GerarVendaOrdemServicoBodyDto }>(
    "/ordens-servico/:ordemServicoId/gerar-venda",
    { preHandler: [authGuard] },
    gerarVendaDaOrdemServicoController,
  );
};
