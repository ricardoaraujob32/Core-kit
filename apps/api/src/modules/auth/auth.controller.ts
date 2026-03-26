// apps/api/src/modules/auth/auth.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { createFnEmitirSessao, createFnRotacionarRefresh, type LocatarioId } from "@core-kit/core";
import { sendHttpError } from "../../http/serializarErroApp";
import { createAuthHttpRuntime } from "../../infra/auth";

/**
 * Payload HTTP esperado no endpoint de login.
 *
 * Campos:
 * - `locatarioId`: escopo do login;
 * - `email`: credencial do usuário;
 * - `senha`: segredo em texto puro recebido da borda.
 */
type LoginBody = {
  locatarioId: LocatarioId;
  email: string;
  senha: string;
};

/**
 * Payload HTTP esperado no endpoint de refresh.
 *
 * Campos:
 * - `locatarioId`: locatário esperado para o refresh;
 * - `refreshToken`: token bruto enviado pelo cliente.
 */
type RefreshBody = {
  locatarioId: LocatarioId;
  refreshToken: string;
};

/**
 * Controller HTTP de login.
 *
 * Fluxo:
 * 1. cria runtime de auth;
 * 2. executa `emitirSessao`;
 * 3. em caso de erro, serializa `ErroApp` para HTTP;
 * 4. em caso de sucesso, devolve a sessão materializada.
 *
 * Observação:
 * - este controller não assina JWT manualmente;
 * - o access token já vem pronto do Core.
 *
 * @param request Requisição Fastify com `LoginBody`.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP de sucesso ou erro.
 */
export async function loginController(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
  const authRuntime = createAuthHttpRuntime();
  const emitirSessao = createFnEmitirSessao(authRuntime.emitirSessaoDeps);

  const resultado = await emitirSessao({
    locatarioId: request.body.locatarioId,
    email: request.body.email,
    senha: request.body.senha,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    accessToken: resultado.value.sessao.accessToken,
    refreshToken: resultado.value.sessao.refreshToken,
    accessExpiraEm: resultado.value.sessao.accessExpiraEm,
    refreshExpiraEm: resultado.value.sessao.refreshExpiraEm,
  });
}

/**
 * Controller HTTP de rotação de refresh token.
 *
 * Fluxo:
 * 1. cria runtime de auth;
 * 2. executa `rotacionarRefresh`;
 * 3. serializa erro HTTP quando necessário;
 * 4. devolve nova sessão materializada.
 *
 * @param request Requisição Fastify com `RefreshBody`.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP de sucesso ou erro.
 */
export async function refreshController(request: FastifyRequest<{ Body: RefreshBody }>, reply: FastifyReply) {
  const authRuntime = createAuthHttpRuntime();
  const rotacionarRefresh = createFnRotacionarRefresh(authRuntime.rotacionarRefreshDeps);

  const resultado = await rotacionarRefresh({
    locatarioId: request.body.locatarioId,
    refreshToken: request.body.refreshToken,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    accessToken: resultado.value.sessao.accessToken,
    refreshToken: resultado.value.sessao.refreshToken,
    accessExpiraEm: resultado.value.sessao.accessExpiraEm,
    refreshExpiraEm: resultado.value.sessao.refreshExpiraEm,
  });
}
