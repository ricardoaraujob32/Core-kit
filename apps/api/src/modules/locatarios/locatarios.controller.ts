// apps/api/src/modules/locatarios/locatarios.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { createFnBuildContextFromRequest } from "../../http/context";
import { sendHttpError } from "../../http/serializarErroApp";
import { createLocatariosRepositorioAuthPrisma } from "../../infra/auth";
import { clientePrisma } from "../../infra/prisma/client";
import { createFnListarLocatarios, createFnObterLocatario } from "@core-kit/core";

/**
 * 
 * 
 */
const buildContextFromRequest = createFnBuildContextFromRequest();

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
async function obterCtxOuResponderErro(request: FastifyRequest, reply: FastifyReply) {
  const ctxRes = await buildContextFromRequest(request);

  if (!ctxRes.ok) {
    sendHttpError(reply, ctxRes.error);
    return null;
  }

  return ctxRes.value;
}

/**
 * Regra temporária/operacional:
 * o fluxo superadmin atual é reconhecido pelo escopo de plataforma.
 *
 * Quando o catálogo de permissões de superadmin estiver consolidado
 * para a borda HTTP, substitua esta verificação por guard baseado
 * em permissão explícita do Core.
 */
function isFluxoSuperAdmin(ctx: { locatarioId: string }): boolean {
  return ctx.locatarioId === "plataforma";
}

/**
 * Controller do tenant admin:
 * só permite consultar o próprio locatário.
 */
export async function obterMeuLocatarioController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const ctx = await obterCtxOuResponderErro(request, reply);
  if (!ctx) return;

  if (request.params.id !== ctx.locatarioId) {
    return sendHttpError(reply, {
      codigo: "NAO_AUTORIZADO",
      mensagem: "Admin do locatário só pode consultar o próprio locatário.",
    });
  }

  const repo = createLocatariosRepositorioAuthPrisma(clientePrisma);
  const obterLocatario = createFnObterLocatario({ locRepo: repo });

  const resultado = await obterLocatario({
    locatarioId: request.params.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}

/**
 * Controller de listagem global de locatários.
 * Uso exclusivo do fluxo superadmin.
 */
export async function listarLocatariosSuperAdminController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await obterCtxOuResponderErro(request, reply);
  if (!ctx) return;

  if (!isFluxoSuperAdmin(ctx)) {
    return sendHttpError(reply, {
      codigo: "NAO_AUTORIZADO",
      mensagem: "A listagem global de locatários é restrita ao fluxo superadmin.",
    });
  }

  const repo = createLocatariosRepositorioAuthPrisma(clientePrisma);
  const listarLocatarios = createFnListarLocatarios({ locRepo: repo });

  const resultado = await listarLocatarios({});

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: resultado.value.itens ?? resultado.value,
  });
}

/**
 * Controller de consulta global de locatário por superadmin.
 */
export async function obterLocatarioSuperAdminController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const ctx = await obterCtxOuResponderErro(request, reply);
  if (!ctx) return;

  if (!isFluxoSuperAdmin(ctx)) {
    return sendHttpError(reply, {
      codigo: "NAO_AUTORIZADO",
      mensagem: "Consulta global de locatários é restrita ao fluxo superadmin.",
    });
  }

  const repo = createLocatariosRepositorioAuthPrisma(clientePrisma);
  const obterLocatario = createFnObterLocatario({ locRepo: repo });

  const resultado = await obterLocatario({
    locatarioId: request.params.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}
