// apps/api/src/modules/usuarios/usuarios.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { createFnBuildContextFromRequest } from "../../http/context";
import { sendHttpError } from "../../http/serializarErroApp";
import { createUsuariosRepositorioAuthPrisma } from "../../infra/auth";
import { clientePrisma } from "../../infra/prisma/client";
import { createFnListarUsuariosPorLocatario } from "@core-kit/core";

/**
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
 * Lista usuários do locatário do contexto autenticado.
 *
 * Fluxo:
 * - authGuard autentica;
 * - context.ts resolve ContextoExecucao;
 * - usecase do Core lista usuários no escopo do locatário.
 */
export async function listarUsuariosController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await obterCtxOuResponderErro(request, reply);
  if (!ctx) return;

  const repo = createUsuariosRepositorioAuthPrisma(clientePrisma);
  const listarUsuariosPorLocatario = createFnListarUsuariosPorLocatario({ usuariosRepo: repo });

  const resultado = await listarUsuariosPorLocatario({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: resultado.value.itens ?? resultado.value,
  });
}
