// apps/api/src/modules/auth/auth.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { createAuthHttpRuntime } from "../../infra/prisma/auth/index.js";
import { LoginBody, LoginResponse, LogoutBody, MeResponse, RefreshBody, RefreshResponse, SessionUserDto } from "./auth.dto.js";
import { ContextoExecucao, LocatarioId, metaAcao, UsuarioId } from "@core-kit/core";
import { getAuthorizationBootstrap } from "../../bootstrap/authorizationBootstrap.js";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { auditar } from "../auditoria/auditoria.dispatcher.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import { toUsuarioSessaoDto } from "./auth.presenter.js";

/**
 * Serializa o contexto autorizado para o shape de usuário esperado pelo frontend.
 */
function serializarUsuarioSessao(ctx: ContextoExecucao): SessionUserDto {
  return {
    usuarioId: ctx.usuarioId,
    locatarioId: ctx.locatarioId,
    perfil: "TENANT",
  };
}

function serializarUsuarioPlataformaSessao(params: {
  usuarioId: UsuarioId;
}): SessionUserDto {
  return {
    usuarioId: params.usuarioId,
    locatarioId: null,
    perfil: "PLATAFORMA",
  };
}

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
  const resultado = await getAuthBootstrap().runtime.emitirSessao({
    locatarioSlug: request.body.locatarioSlug,
    email: request.body.email,
    senha: request.body.senha,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
   }// else {
  // await auditar(
  //   {
  //     escopo: "LOCATARIO",
  //     locatarioId: resultado.value.sessao.locatarioId ?? null,
  //     usuarioId: resultado.value.sessao.usuarioId ?? null,
  //     origem: "API",
  //     requisicaoId: null,
  //     enderecoIp: request.ip ?? null,
  //     agenteUsuario: request.headers["user-agent"] ?? null,
  //     agenteTipo: "USUARIO_AUTENTICADO",
  //   },
  //   {
  //     evento: "auth.login.sucesso",
  //     sucesso: true,
  //     entidadeTipo: "sessao",
  //     entidadeId: resultado.value.contexto?.usuarioId ?? null,
  //     erroCodigo: null,
  //     erroMensagem: null,
  //     metadados: metaAcao({
  //       locatarioSlug: request.body.locatarioSlug,
  //       email: request.body.email,
  //     }),
  //   },);
  // }

  const payload: LoginResponse = {
    accessToken: resultado.value.sessao.accessToken,
    refreshToken: resultado.value.sessao.refreshToken,
  };

  return reply.status(200).send(payload);
}

/**
 * Controller HTTP da sessão atual.
 *
 * Fluxo:
 * - pressupõe autenticação prévia via `authGuard`;
 * - obtém o contexto já resolvido pela borda;
 * - serializa o usuário autenticado/autorizado para o frontend.
 */
export async function meController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  console.dir(ctx, { depth: null });
  
  return reply.status(200).send({
    usuario: toUsuarioSessaoDto(ctx),
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
  // const resultado = await authRuntime.rotacionarRefresh({
  //   locatarioId: request.body.locatarioId,
  //   refreshToken: request.body.refreshToken,
  // });

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

  // if (!resultado.ok) {
  //   return sendHttpError(reply, resultado.error);
  // }

  // const payload: RefreshResponse = {
  //   accessToken: resultado.value.sessao.accessToken,
  //   refreshToken: resultado.value.sessao.refreshToken,
  // };

  // return reply.status(200).send(payload);

  const refreshToken = request.body?.refreshToken ?? "";
  const locatarioId = request.body?.locatarioId;

  console.info("[auth.refresh] request.received", {
    locatarioId,
    hasRefreshToken: typeof refreshToken === "string" && refreshToken.length > 0,
    refreshTokenLength: typeof refreshToken === "string" ? refreshToken.length : 0,
  });

  try {
    const resultado = await getAuthBootstrap().runtime.rotacionarRefresh({
      locatarioId,
      refreshToken,
    });

    if (!resultado.ok) {
      console.warn("[auth.refresh] result.error", {
        locatarioId,
        codigo: resultado.error.codigo,
        mensagem: resultado.error.mensagem,
        detalhes: resultado.error.detalhes ?? null,
      });

      return sendHttpError(reply, resultado.error);
    }

    const payload: RefreshResponse = {
      accessToken: resultado.value.sessao.accessToken,
      refreshToken: resultado.value.sessao.refreshToken,
    };

    console.info("[auth.refresh] result.ok", {
      locatarioId,
      hasAccessToken: Boolean(payload.accessToken),
      hasRefreshToken: Boolean(payload.refreshToken),
    });

    return reply.status(200).send(payload);
  } catch (causa) {
    console.error("[auth.refresh] unhandled.exception", {
      locatarioId,
      errorName: causa instanceof Error ? causa.name : "UnknownError",
      errorMessage: causa instanceof Error ? causa.message : String(causa),
      stack: causa instanceof Error ? causa.stack : undefined,
    });

    return sendHttpError(reply, {
      codigo: "ERRO_INTERNO",
      mensagem: "Falha interna ao rotacionar refresh token.",
      detalhes: {
        operacao: "http.auth.refresh",
      },
    });
  }
}

/**
 * Controller HTTP de logout.
 *
 * Estratégia atual:
 * - revoga o refresh token atual;
 * - responde `204 No Content`.
 */
export async function logoutController(request: FastifyRequest<{ Body: LogoutBody }>, reply: FastifyReply) {
  const resultado = await getAuthBootstrap().runtime.logout({
    locatarioId: request.body.locatarioId,
    refreshToken: request.body.refreshToken,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  } else {
  const ctx = await autorizarHttp(request, reply);
  if (ctx) {
    await auditarController(request, ctx, {
      evento: "auth.logout.sucesso",
      sucesso: true,
      entidadeTipo: "sessao",
      erroCodigo: null,
      erroMensagem: null,
      metadados: metaAcao({
        locatarioId: request.body.locatarioId,
      }),
    });
  }
  }

  return reply.status(204).send();
}
