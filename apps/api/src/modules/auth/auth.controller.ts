import type { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../../infra/prisma/client";

function criarCtx() {
  return criarContextoExecucao({
    locatarioId: "plataforma",
    usuarioId: null,
    papeis: [],
    permissoes: [],
  });
}

export async function loginController(
  request: FastifyRequest<{
    Body: { email: string; senha: string; locatarioId?: string | null };
  }>,
  reply: FastifyReply,
) {
  const authInfra = criarAuthInfraPrisma(clientePrisma);
  const usecase = criarEmitirSessaoUseCase(authInfra);
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

export async function refreshController(
  request: FastifyRequest<{ Body: { refreshToken: string } }>,
  reply: FastifyReply,
) {
  const authInfra = criarAuthInfraPrisma(clientePrisma);
  const usecase = criarRotacionarRefreshUseCase(authInfra);
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