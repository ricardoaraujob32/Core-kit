// apps/api/src/modules/auth/auth.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp";
import { createAuthHttpRuntime } from "../../infra/prisma/auth";
import { LoginBody, RefreshBody } from "./auth.dto";
import { metaAcao } from "@core-kit/core";

/**
 * Serializa a sessão materializada no formato HTTP da API.
 *
 * @param sessao Sessão retornada pelo Core.
 * @returns Payload HTTP de sucesso.
 */
function serializarSessaoHttp(sessao: {
  accessToken: string;
  refreshToken: string;
  accessExpiraEm: Date;
  refreshExpiraEm: Date;
}) {
  return {
    accessToken: sessao.accessToken,
    refreshToken: sessao.refreshToken,
    accessExpiraEm: sessao.accessExpiraEm,
    refreshExpiraEm: sessao.refreshExpiraEm,
  };
}

/**
 * Cria contexto de auditoria para fluxos de auth não autenticados ou
 * semi-autenticados.
 *
 * Observação:
 * - login ainda pode ocorrer sem `usuarioId` resolvido na borda;
 * - refresh também pode falhar antes da materialização completa da nova sessão.
 *
 * @param request Requisição atual.
 * @param params Dados complementares do fluxo.
 * @returns Contexto compatível com o dispatcher.
 */
// function criarContextoAuditoriaAuth(
//   request: FastifyRequest,
//   params?: {
//     locatarioId?: string | null;
//     agenteTipo?: string | null;
//   },
// ) {
//   return criarContextoAuditoria(request, {
//     usuarioId: null,
//     locatarioId: params?.locatarioId ?? null,
//     agenteTipo: params?.agenteTipo ?? "USUARIO_ANONIMO",
//     origem: "API",
//   });
// }

/**
 * Runtime oficial de autenticação usado pela borda HTTP.
 *
 * Observação:
 * - centraliza a composição da auth;
 * - evita wiring repetido em cada controller.
 */
const authRuntime = createAuthHttpRuntime();

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
  const resultado = await authRuntime.emitirSessao({
    locatarioSlug: request.body.locatarioSlug,
    email: request.body.email,
    senha: request.body.senha,
  });

  // await auditar(criarContextoAuditoriaAuth(request),
  //   {
  //     evento: resultado.ok ? "auth.login.sucesso" : "auth.login.falha",
  //     sucesso: resultado.ok,
  //     entidadeTipo: "sessao",
  //     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //     metadados: metaAcao({
  //       locatarioSlug: request.body.locatarioSlug,
  //       email: request.body.email,
  //     }),
  //   },
  // );

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
  const resultado = await authRuntime.rotacionarRefresh({
    locatarioId: request.body.locatarioId,
    refreshToken: request.body.refreshToken,
  });

  // await auditar(criarContextoAuditoriaAuth(request, { locatarioId: request.body.locatarioId, agenteTipo: "TOKEN_REFRESH", }),
  //   {
  //     evento: resultado.ok ? "auth.refresh.sucesso" : "auth.refresh.falha",
  //     sucesso: resultado.ok,
  //     entidadeTipo: "sessao",
  //     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //     metadados: metaAcao({
  //       locatarioId: request.body.locatarioId,
  //     }),
  //   },
  // );

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
