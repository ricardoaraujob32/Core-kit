// apps/api/src/http/serializarErroApp.ts

import { ErroApp } from "@core-kit/core";
import type { FastifyReply } from "fastify";

/**
 * Códigos de erro aceitos pela borda HTTP.
 */
export type CodigoErroHttp =
  | "NAO_AUTENTICADO"
  | "NAO_AUTORIZADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "CONFLITO"
  | "LOCATARIO_OBRIGATORIO"
  | "LOCATARIO_INVALIDO"
  | "SESSAO_INVALIDA"
  | "TOKEN_INVALIDO"
  | "TOKEN_EXPIRADO"
  | "REFRESH_TOKEN_INVALIDO"
  | "REFRESH_TOKEN_EXPIRADO"
  | "REFRESH_TOKEN_REVOGADO"
  | "ERRO_INTERNO";

/**
 * Payload HTTP serializado para erros da API.
 */
export type ErroHttpPayload = {
  erro: {
    codigo: CodigoErroHttp;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
};

/**
 * Estrutura mínima que a borda aceita para serialização.
 *
 * Observação:
 * - `codigo` é string livre na entrada para permitir normalização;
 * - a borda adapta essa entrada para `CodigoErroHttp`.
 */
export type ErroHttpLike = {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
};

/**
 * Lista de aliases que devem ser tratados como falhas de autenticação/sessão.
 *
 * O objetivo é capturar códigos semanticamente equivalentes mesmo quando
 * ainda não fazem parte do conjunto mínimo original do contrato HTTP.
 */
const CODIGOS_NAO_AUTENTICADO = new Set<string>([
  "NAO_AUTENTICADO",
  "SESSAO_INVALIDA",
  "TOKEN_INVALIDO",
  "TOKEN_EXPIRADO",
  "REFRESH_TOKEN_INVALIDO",
  "REFRESH_TOKEN_EXPIRADO",
  "REFRESH_TOKEN_REVOGADO",
]);

/**
 * Lista de aliases que devem ser tratados como falhas de autorização.
 */
const CODIGOS_NAO_AUTORIZADO = new Set<string>([
  "NAO_AUTORIZADO",
  "LOCATARIO_INVALIDO",
]);

/**
 * Lista de aliases que devem ser tratados como erro de requisição inválida.
 */
const CODIGOS_BAD_REQUEST = new Set<string>([
  "INVALIDO",
  "LOCATARIO_OBRIGATORIO",
]);

/**
 * Verifica se um valor pertence ao catálogo HTTP explícito.
 *
 * @param codigo Código a validar.
 * @returns `true` quando o código já pertence ao conjunto oficial da borda.
 */
function isCodigoErroHttp(codigo: string): codigo is CodigoErroHttp {
  switch (codigo) {
    case "NAO_AUTENTICADO":
    case "NAO_AUTORIZADO":
    case "INVALIDO":
    case "NAO_ENCONTRADO":
    case "CONFLITO":
    case "LOCATARIO_OBRIGATORIO":
    case "LOCATARIO_INVALIDO":
    case "SESSAO_INVALIDA":
    case "TOKEN_INVALIDO":
    case "TOKEN_EXPIRADO":
    case "REFRESH_TOKEN_INVALIDO":
    case "REFRESH_TOKEN_EXPIRADO":
    case "REFRESH_TOKEN_REVOGADO":
    case "ERRO_INTERNO":
      return true;
    default:
      return false;
  }
}

/**
 * Normaliza códigos arbitrários para o contrato HTTP da borda.
 *
 * Regras:
 * - se o código já for oficial, é preservado;
 * - aliases de sessão/token são convertidos para códigos HTTP explícitos;
 * - códigos totalmente desconhecidos continuam sendo mapeados para `ERRO_INTERNO`.
 *
 * @param codigo Código recebido do Core ou da infra.
 * @returns Código compatível com o contrato HTTP da API.
 */
export function normalizarCodigoErroHttp(codigo: string): CodigoErroHttp {
  if (isCodigoErroHttp(codigo)) {
    return codigo;
  }

  if (CODIGOS_NAO_AUTENTICADO.has(codigo)) {
    return "NAO_AUTENTICADO";
  }

  if (CODIGOS_NAO_AUTORIZADO.has(codigo)) {
    return "NAO_AUTORIZADO";
  }

  if (CODIGOS_BAD_REQUEST.has(codigo)) {
    return "INVALIDO";
  }

  return "ERRO_INTERNO";
}

/**
 * Verifica se a mensagem sugere uma falha de autenticação/sessão mesmo quando
 * o código não ajuda o suficiente.
 *
 * Observação:
 * - este fallback é propositalmente conservador;
 * - ele existe para reduzir 500 genérico em cenários de auth já conhecidos.
 *
 * @param mensagem Mensagem de erro recebida.
 * @returns `true` quando a mensagem indica forte relação com autenticação.
 */
function mensagemSugereNaoAutenticado(mensagem: string): boolean {
  const texto = mensagem.toLowerCase();

  return (
    texto.includes("sessão inválida") ||
    texto.includes("sessao invalida") ||
    texto.includes("token inválido") ||
    texto.includes("token invalido") ||
    texto.includes("token expirado") ||
    texto.includes("refresh token inválido") ||
    texto.includes("refresh token invalido") ||
    texto.includes("refresh token expirado") ||
    texto.includes("refresh token revogado") ||
    texto.includes("não autenticado") ||
    texto.includes("nao autenticado")
  );
}

/**
 * Adapta um erro da aplicação para o contrato HTTP.
 *
 * Regras:
 * - preserva códigos oficiais;
 * - normaliza aliases conhecidos;
 * - usa fallback por mensagem apenas quando o código seria `ERRO_INTERNO`
 *   mas a mensagem indica claramente um caso de autenticação;
 * - mantém `detalhes` quando seguros e disponíveis.
 *
 * @param error Erro vindo do Core ou da infraestrutura.
 * @returns Estrutura compatível com a borda HTTP.
 */
export function toErroHttpLike(error: ErroApp | ErroHttpLike): {
  codigo: CodigoErroHttp;
  mensagem: string;
  detalhes?: Record<string, unknown>;
} {
  const codigoNormalizado = normalizarCodigoErroHttp(error.codigo);

  if (
    codigoNormalizado === "ERRO_INTERNO" &&
    mensagemSugereNaoAutenticado(error.mensagem)
  ) {
    return {
      codigo: "NAO_AUTENTICADO",
      mensagem: error.mensagem,
      detalhes: error.detalhes,
    };
  }

  return {
    codigo: codigoNormalizado,
    mensagem: error.mensagem,
    detalhes: error.detalhes,
  };
}

/**
 * Mapeia o código de erro HTTP para status code.
 *
 * @param codigo Código de erro já normalizado para a borda HTTP.
 * @returns Status HTTP correspondente.
 */
export function mapCodigoErroToCodigoHTTP(codigo: CodigoErroHttp): number {
  switch (codigo) {
    case "INVALIDO":
    case "LOCATARIO_OBRIGATORIO":
      return 400;

    case "NAO_AUTENTICADO":
    case "SESSAO_INVALIDA":
    case "TOKEN_INVALIDO":
    case "TOKEN_EXPIRADO":
    case "REFRESH_TOKEN_INVALIDO":
    case "REFRESH_TOKEN_EXPIRADO":
    case "REFRESH_TOKEN_REVOGADO":
      return 401;

    case "NAO_AUTORIZADO":
    case "LOCATARIO_INVALIDO":
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

/**
 * Remove chaves com valor `undefined` do payload final.
 *
 * @typeParam T Tipo do objeto de entrada.
 * @param obj Objeto a ser limpo.
 * @returns Objeto sem campos `undefined`.
 */
export function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as T;
}

/**
 * Converte erro normalizado para o payload HTTP oficial.
 *
 * @param error Erro já adaptado para o contrato HTTP.
 * @returns Payload final serializável para a API.
 */
export function toHttpErrorBody(error: {
  codigo: CodigoErroHttp;
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

/**
 * Serializa um erro da aplicação para o contrato HTTP oficial da API.
 *
 * Fluxo:
 * 1. normaliza o código;
 * 2. tenta reduzir casos de auth mascarados;
 * 3. converte para payload HTTP;
 * 4. envia resposta com status apropriado.
 *
 * @param reply Resposta Fastify.
 * @param erro Erro vindo do Core, da infra ou da borda.
 * @returns Resposta HTTP serializada.
 */
export function sendHttpError(reply: FastifyReply, erro: ErroApp | ErroHttpLike) {
  const httpErro = toErroHttpLike(erro);

  return reply
    .status(mapCodigoErroToCodigoHTTP(httpErro.codigo))
    .send(toHttpErrorBody(httpErro));
}
