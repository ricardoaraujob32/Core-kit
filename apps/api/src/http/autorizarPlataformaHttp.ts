// apps/api/src/http/autorizarPlataformaHttp.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { buildContextoHttpFromRequest } from "./context";
import { sendHttpError } from "./serializarErroApp";

export type ContextoPlataformaAutorizado = {
  tipo: "PLATAFORMA";
  usuarioId: string;
  sessionId: string;
  expiraEm: Date;
};

export async function autorizarPlataformaHttp(request: FastifyRequest, reply: FastifyReply): Promise<ContextoPlataformaAutorizado | null> {
  const contexto = await buildContextoHttpFromRequest(request);

  if (!contexto.ok) {
    sendHttpError(reply, contexto.error);
    return null;
  }

  if (contexto.value.tipo !== "PLATAFORMA") {
    sendHttpError(reply, {
      codigo: "NAO_AUTORIZADO",
      mensagem: "Esta operação exige usuário de plataforma.",
      detalhes: {
        operacao: "http.autorizacao.plataforma",
      },
    });
    return null;
  }

  return contexto.value;
}