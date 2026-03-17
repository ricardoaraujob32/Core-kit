import type { FastifyReply, FastifyRequest } from "fastify";

interface JwtPayloadApp {
  sub: string;
  locatarioId?: string | null;
  papeis?: string[];
  permissoes?: string[];
}

export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  try {
    const payload = await request.jwtVerify<JwtPayloadApp>();

    request.usuario = {
      usuarioId: payload.sub,
      locatarioId: payload.locatarioId ?? null,
      papeis: payload.papeis ?? [],
      permissoes: payload.permissoes ?? [],
    };
  } catch {
    return reply.status(401).send({
      erro: {
        codigo: "NAO_AUTENTICADO",
        mensagem: "Token inválido ou ausente.",
      },
    });
  }
}