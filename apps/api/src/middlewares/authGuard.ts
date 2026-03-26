// apps/api/src/middlewares/authGuard.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { createFnValidarSessao } from "@core-kit/core";
import { sendHttpError } from "../http/serializarErroApp";
import { createAuthHttpRuntime } from "../infra/auth";

/**
 * Extrai o bearer token bruto do header Authorization.
 *
 * Regras:
 * - o header deve seguir o formato `Bearer <token>`;
 * - se o header estiver ausente ou malformado, retorna `null`.
 *
 * @param request Requisição Fastify recebida na borda HTTP.
 * @returns Token JWT bruto ou `null`.
 */
function extrairBearerToken(request: FastifyRequest): string | null {
  const raw = request.headers.authorization;
  if (!raw) return null;

  const [scheme, token] = raw.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token?.trim()) {
    return null;
  }

  return token.trim();
}

/**
 * Middleware de autenticação HTTP.
 *
 * Responsabilidades:
 * - extrair o bearer token da requisição;
 * - validar a sessão usando o caso de uso do Core;
 * - traduzir a sessão validada para `request.usuario`;
 * - devolver erro HTTP padronizado quando a autenticação falhar.
 *
 * Observação:
 * - este middleware não resolve permissões;
 * - ele apenas autentica e propaga identidade + metadados da sessão.
 *
 * @param request Requisição Fastify atual.
 * @param reply Resposta Fastify usada para serializar erros.
 * @returns `void` em caso de sucesso ou resposta HTTP de erro em caso de falha.
 */
export async function authGuard(request: FastifyRequest, reply: FastifyReply) {
  const accessToken = extrairBearerToken(request);

  if (!accessToken) {
    return sendHttpError(reply, {
      codigo: "NAO_AUTENTICADO",
      mensagem: "Bearer token ausente.",
    });
  }

  const authRuntime = createAuthHttpRuntime();
  const validarSessao = createFnValidarSessao(authRuntime.validarSessaoDeps);

  const resultado = validarSessao({
    accessToken,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  request.usuario = {
    usuarioId: resultado.value.sessao.usuarioId,
    locatarioId: resultado.value.sessao.locatarioId,
    papeis: [],
    permissoes: [],
    sessionId: resultado.value.sessao.sessionId,
    expiraEm: resultado.value.sessao.expiraEm,
  };
}
