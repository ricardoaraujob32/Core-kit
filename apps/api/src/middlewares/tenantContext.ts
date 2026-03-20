// apps/api/src/middlewares/tenantContext.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../infra/prisma/client";
import { aplicarContextoLocatario } from "../infra/prisma/tenantContext";
import { sendHttpError } from "./serializarErroApp";

export async function tenantContextGuard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const locatarioId = request.usuario?.locatarioId ?? null;

  if (!locatarioId) {
    return sendHttpError(reply, {
      codigo: "LOCATARIO_OBRIGATORIO",
      mensagem: "Locatário não informado no contexto autenticado.",
    });
  }

  await aplicarContextoLocatario(clientePrisma, locatarioId);
}