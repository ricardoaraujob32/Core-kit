// apps/api/src/modules/auth/auth.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../../infra/prisma/client";
import { createContextoExecucao, createFnEmitirSessao, createFnRotacionarRefresh, LocatarioId } from "@core-kit/core";
import { criarAuthInfraPrisma } from "../../infra/auth/authTransacaoPrisma";

/**
 * 
 * @returns 
 */
function criarCtx() {
  return createContextoExecucao({
    locatarioId: "plataforma",
    usuarioId: "superadmin",
    papeis: [],
    permissoes: [],
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function loginController(request: FastifyRequest<{ Body: { email: string; senha: string; locatarioId?: LocatarioId | null } }>, reply: FastifyReply) {
  const authInfra = criarAuthInfraPrisma(clientePrisma);
  const usecase = createFnEmitirSessao(authInfra);
  const resultado = await usecase(criarCtx(), request.body);

  if (!resultado.ok) {
    return reply
      .status(statusHttpPorCodigoErro(resultado.error.codigo))
      .send(serializarErroApp(resultado.error));
  }

  const acesso = await reply.jwtSign({
    sub: resultado.value.usuario.id,
    locatarioId: resultado.value.usuario.locatarioId,
    papeis: resultado.value.contexto.papeis,
    permissoes: resultado.value.contexto.permissoes,
  });

  return reply.status(200).send({
    accessToken: acesso,
    refreshToken: resultado.value.refreshToken,
    usuario: resultado.value.usuario,
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function refreshController(request: FastifyRequest<{ Body: { refreshToken: string } }>, reply: FastifyReply) {
  const authInfra = criarAuthInfraPrisma(clientePrisma);
  const usecase = createFnRotacionarRefresh(authInfra);
  const resultado = await usecase(criarCtx(), request.body);

  if (!resultado.ok) {
    return reply
      .status(statusHttpPorCodigoErro(resultado.error.codigo))
      .send(serializarErroApp(resultado.error));
  }

  const acesso = await reply.jwtSign({
    sub: resultado.value.usuario.id,
    locatarioId: resultado.value.usuario.locatarioId,
    papeis: resultado.value.contexto.papeis,
    permissoes: resultado.value.contexto.permissoes,
  });

  return reply.status(200).send({
    accessToken: acesso,
    refreshToken: resultado.value.refreshToken,
  });
}
