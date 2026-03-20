import type { FastifyReply } from "fastify";

/**
 * 
 */
export type CodigoErroHttp =
  | "NAO_AUTENTICADO"
  | "NAO_AUTORIZADO"
  | "LOCATARIO_OBRIGATORIO"
  | "LOCATARIO_INVALIDO"
  | "ERRO_INTERNO";

/**
 * 
 */
export type ErroHttpPayload = {
  erro: {
    codigo: CodigoErroHttp;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
};

/**
 * 
 * @param codigo 
 * @returns 
 */
export function mapCodigoErroToCodigoHTTP(codigo: CodigoErroHttp): number {
  switch (codigo) {
    case "LOCATARIO_OBRIGATORIO":
      return 400;
    case "NAO_AUTENTICADO":
      return 401;
    case "NAO_AUTORIZADO":
    case "LOCATARIO_INVALIDO":
      return 403;
  //  case "NAO_ENCONTRADO":
  //    return 404;
  //  case "CONFLITO":
  //    return 409;
    case "ERRO_INTERNO":
    default:
      return 500;
  }
}

/**
 * 
 * @param obj 
 * @returns 
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

export function toHttpErrorBody(error: {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}): ErroHttpPayload {
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
    .status(mapCodigoErroToCodigoHTTP(error.codigo))
    .send(toHttpErrorBody(error));
}