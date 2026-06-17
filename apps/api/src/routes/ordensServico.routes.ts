import type { FastifyPluginAsync } from "fastify";
import {
  aguardarOrdemServicoController,
  atualizarOrdemServicoController,
  cancelarOrdemServicoController,
  concluirOrdemServicoController,
  criarOrdemServicoController,
  gerarVendaDaOrdemServicoController,
  iniciarOrdemServicoController,
  listarOrdensServicoController,
  obterOrdemServicoController,
} from "../modules/ordensServico/ordensServico.controller.js";

export const ordensServicoRoutes: FastifyPluginAsync = async (app) => {
  app.get("/ordens-servico", listarOrdensServicoController);
  app.post("/ordens-servico", criarOrdemServicoController);
  app.get("/ordens-servico/:ordemServicoId", obterOrdemServicoController);
  app.patch("/ordens-servico/:ordemServicoId", atualizarOrdemServicoController);
  app.post("/ordens-servico/:ordemServicoId/iniciar", iniciarOrdemServicoController);
  app.post("/ordens-servico/:ordemServicoId/aguardar", aguardarOrdemServicoController);
  app.post("/ordens-servico/:ordemServicoId/concluir", concluirOrdemServicoController);
  app.post("/ordens-servico/:ordemServicoId/cancelar", cancelarOrdemServicoController);
  app.post("/ordens-servico/:ordemServicoId/gerar-venda", gerarVendaDaOrdemServicoController);
};
