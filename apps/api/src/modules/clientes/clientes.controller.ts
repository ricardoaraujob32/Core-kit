// apps/api/src/modules/clientes/clientes.controller.ts

import { createFnAtualizarCliente, createFnCriarCliente, createFnExcluirCliente, createFnListarClientes, createFnObterCliente, metaAcao, metaAtualizacao, metaCriacao } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { createClientesRepositorio } from "../../infra/prisma/clientes/clientesRepositorioPrisma.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createAuthHttpRuntime } from "../../infra/prisma/auth/index.js";
import { AtualizarClienteBodyDto, ClienteIdParamsDto, CriarClienteBodyDto, parseAtualizarClienteBody, parseClienteIdParams, parseCriarClienteBody } from "./clientes.dto.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { toClienteResponseDto, toListarClientesResponseDto } from "./clientes.presenter.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import type { Permissao } from "@core-kit/core";

const MODULO = "VENDAS" as const;
const PERMISSOES = {
  listar: "tenant.cliente.listar" as Permissao,
  criar: "tenant.cliente.criar" as Permissao,
  atualizar: "tenant.cliente.atualizar" as Permissao,
  excluir: "tenant.cliente.excluir" as Permissao,
};

function criarDepsClientes() {
  return {
    clientesRepositorio: createClientesRepositorio(clientePrisma),
    transacao: getAuthBootstrap().runtime.transacao,
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
  };
}

function responderErroValidacao(reply: FastifyReply, parseResult: {
  error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } };
}) {
  const { fieldErrors, formErrors } = parseResult.error.flatten();

  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: formErrors[0],
    detalhes: { campos: fieldErrors },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function listarClientesController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.listar,
    modulo: MODULO,
  });
  if (!ctx) return;

  const { clientesRepositorio } = criarDepsClientes();

  const listarClientes = createFnListarClientes({ clientesRepositorio });

  const res = await listarClientes({ locatarioId: ctx.locatarioId });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    itens: toListarClientesResponseDto(res.value.itens),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function obterClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto }>, reply: FastifyReply) {
  const parse = parseClienteIdParams(request.params);
  if (!parse.success) return responderErroValidacao(reply, parse);

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.listar,
    modulo: MODULO,
  });
  if (!ctx) return;

  const { clientesRepositorio } = criarDepsClientes();

  const obterCliente = createFnObterCliente({ clientesRepositorio });

  const res = await obterCliente({
    locatarioId: ctx.locatarioId,
    clienteId: parse.data.id,
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarClienteController(request: FastifyRequest<{ Body: CriarClienteBodyDto }>, reply: FastifyReply) {
  const parse = parseCriarClienteBody(request.body);
  if (!parse.success) return responderErroValidacao(reply, parse);

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.criar,
    modulo: MODULO,
  });
  if (!ctx) return;

  const criarCliente = createFnCriarCliente(criarDepsClientes());

  const res = await criarCliente({
    locatarioId: ctx.locatarioId,
    ...parse.data,
  });

  await auditarController(request, ctx, {
    evento: "cliente.criado",
    sucesso: res.ok,
    entidadeTipo: "cliente",
    entidadeId: res.ok ? res.value.clienteId : null,
    entidadeNome: parse.data.nome,
    erroCodigo: !res.ok ? res.error.codigo : null,
    erroMensagem: !res.ok ? res.error.mensagem : null,
    metadados: res.ok
      ? metaCriacao({ clienteId: res.value.clienteId })
      : metaAcao({ body: parse.data }),
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.status(201).send({
    item: { clienteId: res.value.clienteId },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function atualizarClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto; Body: AtualizarClienteBodyDto }>, reply: FastifyReply) {
  const params = parseClienteIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const body = parseAtualizarClienteBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body);

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.atualizar,
    modulo: MODULO,
  });
  if (!ctx) return;

  const atualizarCliente = createFnAtualizarCliente(criarDepsClientes());

  const res = await atualizarCliente({
    locatarioId: ctx.locatarioId,
    clienteId: params.data.id,
    ...body.data,
  });

  await auditarController(request, ctx, {
    evento: "cliente.atualizado",
    sucesso: res.ok,
    entidadeTipo: "cliente",
    entidadeId: params.data.id,
    entidadeNome: res.ok ? res.value.cliente.nome : null,
    erroCodigo: !res.ok ? res.error.codigo : null,
    erroMensagem: !res.ok ? res.error.mensagem : null,
    metadados: res.ok
      ? metaAtualizacao({}, toClienteResponseDto(res.value.cliente), Object.keys(body.data))
      : metaAcao({ clienteId: params.data.id, body: body.data }),
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function excluirClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto }>, reply: FastifyReply) {
  const params = parseClienteIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.excluir,
    modulo: MODULO,
  });
  if (!ctx) return;

  const excluirCliente = createFnExcluirCliente(criarDepsClientes());

  const res = await excluirCliente({
    locatarioId: ctx.locatarioId,
    clienteId: params.data.id,
  });

  await auditarController(request, ctx, {
    evento: "cliente.excluido",
    sucesso: res.ok,
    entidadeTipo: "cliente",
    entidadeId: params.data.id,
    entidadeNome: res.ok ? res.value.cliente.nome : null,
    erroCodigo: !res.ok ? res.error.codigo : null,
    erroMensagem: !res.ok ? res.error.mensagem : null,
    metadados: metaAcao({ clienteId: params.data.id }),
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}
