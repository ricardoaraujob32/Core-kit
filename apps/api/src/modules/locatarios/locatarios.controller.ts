import type { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../../infra/prisma/client";

function criarCtx(request: FastifyRequest) {
  return criarContextoExecucao({
    locatarioId: request.usuario?.locatarioId ?? "plataforma",
    usuarioId: request.usuario?.usuarioId ?? null,
    papeis: request.usuario?.papeis ?? [],
    permissoes: request.usuario?.permissoes ?? [],
  });
}

export async function listarLocatariosController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const repo = criarLocatariosRepositorioPrisma(clientePrisma);
  const usecase = criarListarLocatariosUseCase({ repositorio: repo });
  const resultado = await usecase(criarCtx(request));

  if (!resultado.ok) {
    return reply
      .status(statusHttpPorCodigoErro(resultado.error.codigo))
      .send(serializarErroApp(resultado.error));
  }

  return reply.status(200).send({ itens: resultado.value });
}

export async function obterLocatarioController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repo = criarLocatariosRepositorioPrisma(clientePrisma);
  const usecase = criarObterLocatarioUseCase({ repositorio: repo });
  const resultado = await usecase(criarCtx(request), { id: request.params.id });

  if (!resultado.ok) {
    return reply
      .status(statusHttpPorCodigoErro(resultado.error.codigo))
      .send(serializarErroApp(resultado.error));
  }

  return reply.status(200).send({ item: resultado.value });
}