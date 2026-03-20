// apps/api/src/routes/locatarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { sendHttpError } from "../http/serializarErroApp";
import {
  listarLocatariosController,
  obterLocatarioController,
} from "../modules/locatarios/locatarios.controller";

export const locatariosRoutes: FastifyPluginAsync = async (app) => {
  app.get("/locatarios", { preHandler: [authGuard] }, async (req, reply) => {
    if (!req.usuario?.locatarioId) {
      return sendHttpError(reply, {
        codigo: "NAO_AUTORIZADO",
        mensagem: "A listagem global de locatários é restrita ao fluxo superadmin.",
      });
    }

    return obterLocatarioController(req, reply);
  });

  app.get("/locatarios/:id", { preHandler: [authGuard] }, async (req, reply) => {
    if (!req.usuario?.locatarioId) {
      return sendHttpError(reply, {
        codigo: "NAO_AUTORIZADO",
        mensagem: "Consulta global de locatários é restrita ao fluxo superadmin.",
      });
    }

    const params = req.params as { id?: string };
    if (params.id !== req.usuario.locatarioId) {
      return sendHttpError(reply, {
        codigo: "NAO_AUTORIZADO",
        mensagem: "Admin do locatário só pode consultar o próprio locatário.",
      });
    }

    return obterLocatarioController(req, reply);
  });
};