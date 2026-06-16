// apps/api/src/modules/dashboard/dashboard.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createDashboardResumoRepositorioPrisma } from "../../infra/prisma/dashboard/dashboardResumoRepositorioPrisma.js";
import { serializarDashboardResumo } from "./dashboard.presenter.js";

function createDashboardDeps() {
  return {
    dashboardResumoRepositorio: createDashboardResumoRepositorioPrisma(clientePrisma),
  };
}

export async function obterDashboardResumoController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const deps = createDashboardDeps();

  const resumo = await deps.dashboardResumoRepositorio.obterResumo({
    locatarioId: ctx.locatarioId,
  });

  return reply.status(200).send(serializarDashboardResumo(resumo));
}
