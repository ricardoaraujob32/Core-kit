import type { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../infra/prisma/client";
import { aplicarContextoLocatario } from "../infra/prisma/tenantContext";

export async function tenantContextGuard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const locatarioId =
    request.usuario?.locatarioId ??
    request.headers["x-locatario-id"]?.toString() ??
    null;

  if (!locatarioId) {
    return reply.status(400).send({
      erro: {
        codigo: "LOCATARIO_OBRIGATORIO",
        mensagem: "Locatário não informado.",
      },
    });
  }

  await aplicarContextoLocatario(clientePrisma, locatarioId);
}