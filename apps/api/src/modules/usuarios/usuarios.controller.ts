// apps/api/src/modules/usuarios/usuarios.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { clientePrisma } from "../../infra/prisma/client";
import { createUsuariosRepositorio } from "../../infra/prisma/usuarios/usuariosRepositorioPrisma";
import { createFnAtualizarUsuario, createFnCriarUsuario, createFnDesativarUsuario, createFnListarUsuariosPorLocatario, createFnObterUsuario, 
  createFnReativarUsuario, metaAcao, metaAtualizacao, metaCriacao, Permissoes } from "@core-kit/core";
import { sendHttpError } from "../../http/serializarErroApp";
import { parseAtualizarUsuarioBody, parseCriarUsuarioBody, parseUsuarioIdParams } from "./usuarios.dto";
import type { AtualizarUsuarioBodyDto, CriarUsuarioBodyDto, UsuarioIdParamsDto } from "./usuarios.dto";
import { toListarUsuariosResponseDto, toUsuarioResponseDto } from "./usuarios.presenter";
import { autorizarHttp } from "../../http/autorizarHttp";
import { auditarController } from "../auditoria/auditarController";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap";

/**
 * Monta as dependências operacionais do módulo de usuários na API.
 *
 * Responsabilidades:
 * - criar o repositório operacional Prisma;
 * - fornecer transação local do módulo;
 * - reaproveitar `relogio`, `idPorta` e `hashPorta` do runtime oficial de auth.
 *
 * @returns Dependências prontas para os controllers de usuários.
 */
function criarDepsUsuarios() {
  const usuariosRepositorio = createUsuariosRepositorio(clientePrisma);

  return {
    usuariosRepositorio,
    transacao: getAuthBootstrap().runtime.transacao,
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
    hashPorta: getAuthBootstrap().runtime.emitirSessaoDeps.hashPorta,
  };
}

/**
 * 
 * @param reply 
 * @param parseResult 
 * @returns 
 */
function responderErroValidacao(reply: FastifyReply, parseResult: {
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } };
}) {
  const { fieldErrors, formErrors } = parseResult.error.flatten();

  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: formErrors[0] ?? "Dados inválidos na requisição.",
    detalhes: {
      operacao: "http.usuarios.validacao",
      campos: fieldErrors,
      formulario: formErrors,
    },
  });
}


/**
  * Lista usuários do locatário autenticado.
 *
 * Permissão exigida:
 * - `tenant.usuario.listar`
 *
 * Resposta:
 * - `200 OK` com `{ itens: Usuario[] }`
 *
 * Fluxo:
 * - `authGuard` autentica;
 * - `buildContextFromRequest` resolve o contexto;
 * - o caso de uso do domínio operacional lista usuários no escopo do locatário.
 *
 * Observação:
 * - este controller usa o repositório operacional de usuários;
 * - não depende mais do adapter de auth.
 *
 * @param request Requisição Fastify autenticada.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function listarUsuariosController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_LISTAR,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const { usuariosRepositorio: usuariosRepositorio } = criarDepsUsuarios();

  const listarUsuariosPorLocatario = createFnListarUsuariosPorLocatario({
    usuariosRepositorio: usuariosRepositorio,
  });

  const resultado = await listarUsuariosPorLocatario({
    locatarioId: ctx.locatarioId,
  });

  await auditarController(request, ctx, {
    evento: "usuario.listado",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      quantidadeResultados: resultado.ok ? resultado.value.itens.length : 0,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarUsuariosResponseDto(resultado.value.itens),
  });
}

/**
 * Obtém um usuário específico do locatário autenticado.
 *
 * Permissão exigida:
 * - `tenant.usuario.listar`
 *
 * Resposta:
 * - `200 OK` com `{ item: Usuario }`
 *
 * @param request Requisição Fastify com `params.id`.
 * @param reply Resposta Fastify.
 * @returns Usuário encontrado no escopo do locatário autenticado.
 */
export async function obterUsuarioController(request: FastifyRequest<{ Params: UsuarioIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_OBTER,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const paramsParse = parseUsuarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const { usuariosRepositorio } = criarDepsUsuarios();

  const obterUsuario = createFnObterUsuario({
    usuariosRepositorio,
  });

  const resultado = await obterUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  await auditarController(request, ctx, {
    evento: "usuario.obtido",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: request.params.id,
    entidadeNome: resultado.ok ? resultado.value.usuario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao(),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toUsuarioResponseDto(resultado.value.usuario),
  });
}

/**
 * Cria um novo usuário no locatário autenticado.
 *
 * Permissão exigida:
 * - `tenant.usuario.criar`
 *
 * Fluxo:
 * 1. autoriza a operação;
 * 2. gera hash da senha via porta técnica oficial do runtime de auth;
 * 3. executa o caso de uso de criação no domínio;
 * 4. devolve apenas o identificador criado.
 *
 * Resposta:
 * - `201 Created` com `{ item: { usuarioId } }`
 *
 * @param request Requisição Fastify com `email`, `nome` e `senha`.
 * @param reply Resposta Fastify.
 * @returns Identificador do usuário recém-criado.
 */
export async function criarUsuarioController(request: FastifyRequest<{ Body: CriarUsuarioBodyDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_CRIAR,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const bodyParse = parseCriarUsuarioBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const body = bodyParse.data;

  const senhaHashRes = await getAuthBootstrap().runtime.emitirSessaoDeps.hashPorta.gerarHashSenha(body.senha);
  if (!senhaHashRes.ok) {
    return sendHttpError(reply, senhaHashRes.error);
  }

  const { usuariosRepositorio, transacao, relogio, idPorta } = criarDepsUsuarios();

  const criarUsuario = createFnCriarUsuario({
    usuariosRepositorio,
    transacao,
    relogio,
    idPorta,
  });

  const resultado = await criarUsuario({
    locatarioId: ctx.locatarioId,
    email: request.body.email,
    nome: request.body.nome,
    senhaHash: senhaHashRes.value,
  });

  await auditarController(request, ctx, {
    evento: "usuario.criado",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: resultado.ok ? resultado.value.usuarioId : null,
    entidadeNome: request.body.nome,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: resultado.ok
      ? metaCriacao({
          usuarioId: resultado.value.usuarioId,
          nome: request.body.nome,
          email: request.body.email,
          status: "ATIVO",
        })
      : metaAcao({
          email: request.body.email,
        }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      usuarioId: resultado.value.usuarioId,
    },
  });
}

/**
 * Atualiza dados cadastrais de um usuário.
 *
 * Permissão exigida:
 * - `tenant.usuario.atualizar`
 *
 * Observação:
 * - esta operação não altera senha;
 * - senha continua sendo fluxo separado por regra arquitetural.
 *
 * Resposta:
 * - `200 OK` com `{ item: Usuario }`
 *
 * @param request Requisição Fastify com `params.id` e body parcial.
 * @param reply Resposta Fastify.
 * @returns Usuário atualizado.
 */
export async function atualizarUsuarioController(request: FastifyRequest<{ Params: UsuarioIdParamsDto; Body: AtualizarUsuarioBodyDto; }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_ATUALIZAR,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const paramsParse = parseUsuarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAtualizarUsuarioBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const params = paramsParse.data;
  const body = bodyParse.data;

  const { usuariosRepositorio, transacao, relogio } = criarDepsUsuarios();

  const usuarioAntes = await usuariosRepositorio.buscarPorId({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  const atualizarUsuario = createFnAtualizarUsuario({
    usuariosRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atualizarUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: params.id,
    nome: body.nome,
    email: body.email,
  });

  await auditarController(request, ctx, {
    evento: "usuario.atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: request.params.id,
    entidadeNome: resultado.ok ? resultado.value.usuario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados:
      resultado.ok && usuarioAntes.ok && usuarioAntes.value
        ? metaAtualizacao(
            {
              nome: usuarioAntes.value.nome,
              email: usuarioAntes.value.email,
              status: usuarioAntes.value.status,
            },
            {
              nome: resultado.value.usuario.nome,
              email: resultado.value.usuario.email,
              status: resultado.value.usuario.status,
            },
            [
              ...(request.body.nome !== undefined ? ["nome"] : []),
              ...(request.body.email !== undefined ? ["email"] : []),
            ],
          )
        : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toUsuarioResponseDto(resultado.value.usuario),
  });
}

/**
 * Inativa um usuário do locatário autenticado.
 *
 * Permissão exigida:
 * - `tenant.usuario.atualizar`
 *
 * @param request Requisição Fastify com `params.id`.
 * @param reply Resposta Fastify.
 * @returns Usuário inativado.
 */
export async function desativarUsuarioController(request: FastifyRequest<{ Params: UsuarioIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_INATIVAR,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const paramsParse = parseUsuarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const { usuariosRepositorio, transacao, relogio } = criarDepsUsuarios();

  const usuarioAntes = await usuariosRepositorio.buscarPorId({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  const desativarUsuario = createFnDesativarUsuario({
    usuariosRepositorio,
    transacao,
    relogio,
  });

  const resultado = await desativarUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  await auditarController(request, ctx, {
    evento: "usuario.inativado",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: request.params.id,
    entidadeNome: resultado.ok ? resultado.value.usuario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados:
      resultado.ok && usuarioAntes.ok && usuarioAntes.value
        ? metaAtualizacao(
            { status: usuarioAntes.value.status },
            { status: resultado.value.usuario.status },
            ["status"],
          )
        : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toUsuarioResponseDto(resultado.value.usuario),
  });
}

/**
 * Reativa um usuário do locatário autenticado.
 *
 * Permissão exigida:
 * - `tenant.usuario.atualizar`
 *
 * @param request Requisição Fastify com `params.id`.
 * @param reply Resposta Fastify.
 * @returns Usuário reativado.
 */
export async function reativarUsuarioController(request: FastifyRequest<{ Params: UsuarioIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_USUARIO_INATIVAR,
    modulo: "USUARIOS",
  });
  if (!ctx) return;

  const paramsParse = parseUsuarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const { usuariosRepositorio, transacao, relogio } = criarDepsUsuarios();

  const usuarioAntes = await usuariosRepositorio.buscarPorId({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  const reativarUsuario = createFnReativarUsuario({
    usuariosRepositorio,
    transacao,
    relogio,
  });

  const resultado = await reativarUsuario({
    locatarioId: ctx.locatarioId,
    usuarioId: request.params.id,
  });

  await auditarController(request, ctx, {
    evento: "usuario.reativado",
    sucesso: resultado.ok,
    entidadeTipo: "usuario",
    entidadeId: request.params.id,
    entidadeNome: resultado.ok ? resultado.value.usuario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados:
      resultado.ok && usuarioAntes.ok && usuarioAntes.value
        ? metaAtualizacao(
            { status: usuarioAntes.value.status },
            { status: resultado.value.usuario.status },
            ["status"],
          )
        : undefined,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toUsuarioResponseDto(resultado.value.usuario),
  });
}
