import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { listarLocatariosController, obterLocatarioController } from "../modules/locatarios/locatarios.controller";

export const locatariosRoutes: FastifyPluginAsync = async (app) => {
  app.get("/locatarios", { preHandler: [authGuard] }, listarLocatariosController);
  app.get("/locatarios/:id", { preHandler: [authGuard] }, obterLocatarioController);
};