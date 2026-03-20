// apps/api/src/middlewares/superAdminGuard.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { responderErro } from "../http/httpError";

const PAPEL_SUPERADMIN = "SUPERADMIN";

function possuiPapelSuperAdmin(request: FastifyRequest): boolean {
  return request.usuario?.papeis?.includes(PAPEL_SUPERADMIN) ?? false;
}

export async function superAdminGuard(request: FastifyRequest, reply: FastifyReply) {
  if (!request.usuario?.usuarioId) {
    return responderErro(
      reply,
      {
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário não autenticado.",
      },
      request,
    );
  }

  if (!possuiPapelSuperAdmin(request)) {
    return responderErro(
      reply,
      {
        codigo: "NAO_AUTORIZADO",
        mensagem: "Acesso restrito a superadmin.",
      },
      request,
    );
  }
}
