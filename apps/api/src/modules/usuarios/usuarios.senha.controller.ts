// apps/api/src/modules/usuarios/usuarios.senha.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { createFnAlterarSenhaUsuario, createFnRedefinirSenhaUsuario, Permissoes } from "@core-kit/core";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createUsuariosRepositorio } from "../../infra/prisma/usuarios/usuariosRepositorioPrisma.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import type { AlterarSenhaUsuarioBodyDto, RedefinirSenhaUsuarioBodyDto, UsuarioIdParamsDto } from "./usuarios.dto.js";
import { parseAlterarSenhaUsuarioBody, parseRedefinirSenhaUsuarioBody, parseUsuarioIdParams } from "./usuarios.dto.js";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { createHashPortaAdapter } from "../../infra/hash/hashPortaAdapter.js";

function criarDepsUsuariosSenha() {
  return {
    usuariosRepositorio: createUsuariosRepositorio(clientePrisma),
    hashPorta: createHashPortaAdapter(),
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    transacao: getAuthBootstrap().runtime.transacao,
  };
}

function responderErroValidacao(reply: FastifyReply, issues: Array<{ path: (string | number)[]; message: string }>) {
  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes: {
      campos: issues.map((issue) => ({
        caminho: issue.path.join("."),
        mensagem: issue.message,
      })),
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function alterarMinhaSenhaUsuarioController(
  request: FastifyRequest<{ Params: UsuarioIdParamsDto; Body: AlterarSenhaUsuarioBodyDto;}>, reply: FastifyReply,) {
  const params = parseUsuarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseAlterarSenhaUsuarioBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  if (ctx.usuarioId !== params.data.id) {
    return sendHttpError(reply, {
      codigo: "NAO_AUTORIZADO",
      mensagem: "A operação é permitida apenas no próprio usuário.",
      detalhes: {
        operacao: "http.usuarios.alterarMinhaSenha",
        usuarioIdContexto: ctx.usuarioId,
        usuarioIdSolicitado: params.data.id,
      },
    });
  }

  const { usuariosRepositorio, hashPorta, relogio, transacao } = criarDepsUsuariosSenha();

  const alterarSenhaUsuario = createFnAlterarSenhaUsuario({
    usuariosRepositorio,
    hashPorta,
    relogio,
    transacao,
  });

  const resultado = await alterarSenhaUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: params.data.id,
    senhaAtual: body.data.senhaAtual,
    novaSenha: body.data.novaSenha,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    item: {
      usuarioId: resultado.value.usuarioId,
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function redefinirSenhaUsuarioController(
  request: FastifyRequest<{ Params: UsuarioIdParamsDto; Body: RedefinirSenhaUsuarioBodyDto;}>, reply: FastifyReply,) {
  const params = parseUsuarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseRedefinirSenhaUsuarioBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const ctx = await autorizarHttp(request, reply, {
    locatarioIdAlvo: undefined,
    permissao: Permissoes.TENANT_USUARIO_ATUALIZAR,
  });
  if (!ctx) return;

  const { usuariosRepositorio, hashPorta, relogio, transacao } = criarDepsUsuariosSenha();

  const redefinirSenhaUsuario = createFnRedefinirSenhaUsuario({
    usuariosRepositorio,
    hashPorta,
    relogio,
    transacao,
  });

  const resultado = await redefinirSenhaUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: params.data.id,
    novaSenha: body.data.novaSenha,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    item: {
      usuarioId: resultado.value.usuarioId,
    },
  });
}
