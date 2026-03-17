import type { FastifyReply } from "fastify";

export type HttpErrorBody = {
  erro: {
    codigo: string;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
};

export function mapErrorCodeToStatus(codigo: string): number {
  switch (codigo) {
    case "INVALIDO":
      return 400;
    case "NAO_AUTENTICADO":
      return 401;
    case "NAO_AUTORIZADO":
      return 403;
    case "NAO_ENCONTRADO":
      return 404;
    case "CONFLITO":
      return 409;
    case "ERRO_INTERNO":
    default:
      return 500;
  }
}

export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

export function toHttpErrorBody(error: {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}): HttpErrorBody {
  return {
    erro: stripUndefined({
      codigo: error.codigo,
      mensagem: error.mensagem,
      detalhes: error.detalhes,
    }),
  };
}

export function sendHttpError(
  reply: FastifyReply,
  error: {
    codigo: string;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  }
) {
  return reply
    .status(mapErrorCodeToStatus(error.codigo))
    .send(toHttpErrorBody(error));
}