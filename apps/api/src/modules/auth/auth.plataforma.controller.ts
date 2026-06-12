import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import { type LoginPlataformaBodyDto, parseLoginPlataformaBody } from "./auth.plataforma.dto.js";

function responderErroValidacao(reply: FastifyReply) {
  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes: {
      operacao: "auth.plataforma.login.validacao",
    },
  });
}

export async function loginPlataformaController(request: FastifyRequest<{ Body: LoginPlataformaBodyDto }>, reply: FastifyReply) {
  const body = parseLoginPlataformaBody(request.body);
  if (!body.success) return responderErroValidacao(reply);

  const resultado = await getAuthBootstrap().runtime.emitirSessaoPlataforma({
      email: body.data.email,
      senha: body.data.senha,
    });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    accessToken: resultado.value.accessToken,
    accessExpiraEm: resultado.value.accessExpiraEm,
    usuario: {
      usuarioId: resultado.value.usuarioId,
      locatarioId: null,
      perfil: "PLATAFORMA",
    },
  });
}