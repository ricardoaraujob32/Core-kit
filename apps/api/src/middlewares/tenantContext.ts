// apps/api/src/middlewares/tenantContext.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { executarComContexto } from "../infra/prisma/execucaoComContexto";
import { clientePrisma } from "../infra/prisma/client";

export async function tenantContextGuard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const locatarioId = request.usuario?.locatarioId ?? null;

  if (!locatarioId) {
    return reply.status(400).send({
      codigo: "LOCATARIO_OBRIGATORIO",
      mensagem: "Locatário não informado no contexto autenticado.",
    });
  }
}