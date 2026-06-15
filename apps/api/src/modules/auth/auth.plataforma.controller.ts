import type { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import type { LoginPlataformaBodyDto, RefreshPlataformaBodyDto, LogoutPlataformaBodyDto } from "./auth.plataforma.dto.js";
import { parseLoginPlataformaBody, parseRefreshPlataformaBody, parseLogoutPlataformaBody } from "./auth.plataforma.dto.js";

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
    refreshToken: resultado.value.refreshToken,
    refreshExpiraEm: resultado.value.refreshExpiraEm,
    usuario: {
      usuarioId: resultado.value.usuarioId,
      locatarioId: null,
      perfil: "PLATAFORMA",
    },
  });
}

export async function refreshPlataformaController(
  request: FastifyRequest<{ Body: RefreshPlataformaBodyDto }>,
  reply: FastifyReply,
) {
  const body = parseRefreshPlataformaBody(request.body);
  if (!body.success) return responderErroValidacao(reply);

  const resultado = await getAuthBootstrap().runtime.rotacionarRefreshPlataforma({
    refreshToken: body.data.refreshToken,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    accessToken: resultado.value.sessao.accessToken,
    refreshToken: resultado.value.sessao.refreshToken,
    accessExpiraEm: resultado.value.sessao.accessExpiraEm,
    refreshExpiraEm: resultado.value.sessao.refreshExpiraEm,
    usuario: {
      usuarioId: resultado.value.usuarioId,
      locatarioId: null,
      perfil: "PLATAFORMA",
    },
  });
}

export async function logoutPlataformaController(
  request: FastifyRequest<{ Body: LogoutPlataformaBodyDto }>,
  reply: FastifyReply,
) {
  const body = parseLogoutPlataformaBody(request.body);
  if (!body.success) return responderErroValidacao(reply);

  const resultado = await getAuthBootstrap().runtime.logoutPlataforma({
    refreshToken: body.data.refreshToken,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(204).send();
}