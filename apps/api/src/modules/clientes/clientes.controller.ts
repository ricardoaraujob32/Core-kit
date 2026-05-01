// apps/api/src/modules/clientes/clientes.controller.ts

import { createFnAtualizarCliente, createFnCriarCliente, createFnExcluirCliente, createFnListarClientes, createFnObterCliente } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp";
import { sendHttpError } from "../../http/serializarErroApp";
import { createClientesRepositorio } from "../../infra/prisma/clientes/clientesRepositorioPrisma";
import { clientePrisma } from "../../infra/prisma/client";
import { createAuthHttpRuntime } from "../../infra/prisma/auth";
import { AtualizarClienteBodyDto, ClienteIdParamsDto, CriarClienteBodyDto, parseAtualizarClienteBody, parseClienteIdParams, parseCriarClienteBody } from "./clientes.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { toClienteResponseDto, toListarClientesResponseDto } from "./clientes.presenter";

const authRuntime = createAuthHttpRuntime();

function criarDepsClientes() {
  return {
    clientesRepositorio: createClientesRepositorio(clientePrisma),
    transacao: authRuntime.transacao,
    relogio: authRuntime.emitirSessaoDeps.relogio,
    idPorta: authRuntime.emitirSessaoDeps.idPorta,
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

export async function listarClientesController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { clientesRepositorio } = criarDepsClientes();

  const fn = createFnListarClientes({ clientesRepositorio });

  const res = await fn({ locatarioId: ctx.locatarioId });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    itens: toListarClientesResponseDto(res.value.itens),
  });
}

export async function obterClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto }>, reply: FastifyReply) {
  const parse = parseClienteIdParams(request.params);
  if (!parse.success) return responderErroValidacao(reply, parse);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { clientesRepositorio } = criarDepsClientes();

  const fn = createFnObterCliente({ clientesRepositorio });

  const res = await fn({
    locatarioId: ctx.locatarioId,
    clienteId: parse.data.id,
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}

export async function criarClienteController(request: FastifyRequest<{ Body: CriarClienteBodyDto }>, reply: FastifyReply) {
  const parse = parseCriarClienteBody(request.body);
  if (!parse.success) return responderErroValidacao(reply, parse);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const fn = createFnCriarCliente(criarDepsClientes());

  const res = await fn({
    locatarioId: ctx.locatarioId,
    ...parse.data,
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.status(201).send({
    item: { clienteId: res.value.clienteId },
  });
}

export async function atualizarClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto; Body: AtualizarClienteBodyDto }>, reply: FastifyReply) {
  const params = parseClienteIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const body = parseAtualizarClienteBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const fn = createFnAtualizarCliente(criarDepsClientes());

  const res = await fn({
    locatarioId: ctx.locatarioId,
    clienteId: params.data.id,
    ...body.data,
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}

export async function excluirClienteController(request: FastifyRequest<{ Params: ClienteIdParamsDto }>, reply: FastifyReply) {
  const params = parseClienteIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const fn = createFnExcluirCliente(criarDepsClientes());

  const res = await fn({
    locatarioId: ctx.locatarioId,
    clienteId: params.data.id,
  });

  if (!res.ok) return sendHttpError(reply, res.error);

  return reply.send({
    item: toClienteResponseDto(res.value.cliente),
  });
}