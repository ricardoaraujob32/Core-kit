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

export async function listarUsuariosController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const repo = criarUsuariosRepositorioPrisma(clientePrisma);
  const usecase = criarListarUsuariosUseCase({ repositorio: repo });
  const resultado = await usecase(criarCtx(request));

  if (!resultado.ok) {
    return reply
      .status(statusHttpPorCodigoErro(resultado.error.codigo))
      .send(serializarErroApp(resultado.error));
  }

  return reply.status(200).send({ itens: resultado.value });
}