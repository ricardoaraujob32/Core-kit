// apps/api/src/middlewares/authGuard.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../http/serializarErroApp";
import { createAuthHttpRuntime } from "../infra/prisma/auth";

/**
 * Dependências necessárias para criar o middleware de autenticação.
 */
type AuthGuardDeps = {
  /**
   * Função responsável por validar a sessão a partir do access token.
   */
  validarSessao: ReturnType<typeof createAuthHttpRuntime>["validarSessao"];
};

/**
 * Runtime oficial de autenticação usado pela borda HTTP.
 */
const authRuntime = createAuthHttpRuntime();

/**
 * Middleware oficial de autenticação HTTP.
 *
 * Este middleware:
 * - extrai bearer token;
 * - valida a sessão;
 * - popula `request.usuario`;
 * - não resolve permissões nem aplica autorização fina.
 */
export const authGuard = createFnAuthGuard({
  validarSessao: authRuntime.validarSessao,
});

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
export function createFnAuthGuard(deps: AuthGuardDeps) {
  /**
   * Middleware concreto de autenticação.
   *
   * @param request Requisição Fastify atual.
   * @param reply Resposta Fastify.
   * @returns `void` em caso de sucesso ou resposta HTTP de erro em caso de falha.
   */
  return async function authGuard(request: FastifyRequest, reply: FastifyReply) {
    const accessToken = extrairBearerToken(request);

    if (!accessToken) {
      return sendHttpError(reply, {
        codigo: "NAO_AUTENTICADO",
        mensagem: "Bearer token ausente.",
      });
    }

    console.log("[http.authGuard.start]", {
      url: request.url,
      method: request.method,
      possuiBearer: true,
    });

    const resultado = await Promise.resolve(
      deps.validarSessao({
        accessToken,
      }),
    );

    if (!resultado.ok) {
      console.error("[http.authGuard.err][validarSessao]", {
        url: request.url,
        method: request.method,
        erro: resultado.error,
      });

      return sendHttpError(reply, resultado.error);
    }

    request.usuario = {
      usuarioId: resultado.value.sessao.usuarioId,
      locatarioId: resultado.value.sessao.locatarioId,
      sessionId: resultado.value.sessao.sessionId,
      expiraEm: resultado.value.sessao.expiraEm,
    };

    console.log("[http.authGuard.ok]", {
      url: request.url,
      method: request.method,
      usuarioId: request.usuario.usuarioId,
      locatarioId: request.usuario.locatarioId ?? null,
      sessionId: request.usuario.sessionId ?? null,
      expiraEm: request.usuario.expiraEm ?? null,
    });
  };
}
