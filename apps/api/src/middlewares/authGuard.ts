// apps/api/src/middlewares/authGuard.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { getAuthBootstrap } from "../bootstrap/authBootstrap.js";
import { sendHttpError } from "../http/serializarErroApp.js";

/**
 * Dependências necessárias para criar o middleware de autenticação.
 *
 * Observação:
 * - o tipo vem do bootstrap oficial;
 * - este arquivo não compõe runtime localmente.
 */
type AuthGuardDeps = {
  validarSessao: ReturnType<typeof getAuthBootstrap>["runtime"]["validarSessao"];
};

/**
 * Middleware oficial de autenticação HTTP.
 *
 * Este middleware:
 * - extrai bearer token;
 * - valida a sessão;
 * - popula `request.usuario`;
 * - não resolve permissões;
 * - não monta contexto;
 * - não compõe runtime de auth.
 */
export const authGuard = createFnAuthGuard({
  get validarSessao() {
    return getAuthBootstrap().runtime.validarSessao;
  },
});

/**
 * Extrai o bearer token bruto do header Authorization.
 *
 * Regras:
 * - o header deve seguir o formato `Bearer <token>`;
 * - se o header estiver ausente ou malformado, retorna `null`.
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
 * Cria o middleware concreto de autenticação HTTP.
 */
export function createFnAuthGuard(deps: AuthGuardDeps) {
  return async function authGuard(request: FastifyRequest, reply: FastifyReply) {
    const accessToken = extrairBearerToken(request);

    if (!accessToken) {
      return sendHttpError(reply, {
        codigo: "NAO_AUTENTICADO",
        mensagem: "Token de acesso ausente.",
        detalhes: {
          operacao: "http.authGuard",
        },
      });
    }

    const resultado = await deps.validarSessao({
      accessToken,
    });

    if (!resultado.ok) {
      return sendHttpError(reply, resultado.error);
    }

    request.usuario = {
      usuarioId: resultado.value.sessao.usuarioId,
      locatarioId: resultado.value.sessao.locatarioId,
      sessionId: resultado.value.sessao.sessionId,
      expiraEm: resultado.value.sessao.expiraEm,
    };
  };
}
