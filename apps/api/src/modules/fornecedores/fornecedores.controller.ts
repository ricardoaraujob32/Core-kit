// apps/api/src/modules/fornecedores/fornecedores.controller.ts

import { createFnAtualizarFornecedor, createFnCriarFornecedor, createFnExcluirFornecedor, createFnListarFornecedores, createFnObterFornecedor } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp";
import { sendHttpError } from "../../http/serializarErroApp";
import { createFornecedoresRepositorio } from "../../infra/prisma/fornecedores/fornecedoresRepositorioPrisma";
import { clientePrisma } from "../../infra/prisma/client";
import { createAuthHttpRuntime } from "../../infra/prisma/auth";
import { AtualizarFornecedorBodyDto, CriarFornecedorBodyDto, FornecedorIdParamsDto, parseAtualizarFornecedorBody, parseCriarFornecedorBody, parseFornecedorIdParams } from "./fornecedores.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { toFornecedorResponseDto, toListarFornecedoresResponseDto } from "./fornecedores.presenter";

const authRuntime = createAuthHttpRuntime();

function criarDepsFornecedores() {
  return {
    fornecedoresRepositorio: createFornecedoresRepositorio(clientePrisma),
    transacao: authRuntime.transacao,
    relogio: authRuntime.emitirSessaoDeps.relogio,
    idPorta: authRuntime.emitirSessaoDeps.idPorta,
  };
}

function responderErroValidacao(
  reply: FastifyReply,
  parseResult: {
    error: {
      flatten: () => {
        fieldErrors: Record<string, string[] | undefined>;
        formErrors: string[];
      };
    };
  },
) {
  const { fieldErrors, formErrors } = parseResult.error.flatten();

  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: formErrors[0] ?? "Dados inválidos na requisição.",
    detalhes: {
      operacao: "http.fornecedores.validacao",
      campos: fieldErrors,
      formulario: formErrors,
    },
  });
}

export async function listarFornecedoresController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { fornecedoresRepositorio } = criarDepsFornecedores();

  const listarFornecedores = createFnListarFornecedores({
    fornecedoresRepositorio,
  });

  const resultado = await listarFornecedores({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarFornecedoresResponseDto(resultado.value.itens),
  });
}

export async function obterFornecedorController(request: FastifyRequest<{ Params: FornecedorIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseFornecedorIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { fornecedoresRepositorio } = criarDepsFornecedores();

  const obterFornecedor = createFnObterFornecedor({
    fornecedoresRepositorio,
  });

  const resultado = await obterFornecedor({
    locatarioId: ctx.locatarioId,
    fornecedorId: paramsParse.data.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toFornecedorResponseDto(resultado.value.fornecedor),
  });
}

export async function criarFornecedorController(request: FastifyRequest<{ Body: CriarFornecedorBodyDto }>, reply: FastifyReply) {
  const bodyParse = parseCriarFornecedorBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { fornecedoresRepositorio, transacao, relogio, idPorta } =
    criarDepsFornecedores();

  const criarFornecedor = createFnCriarFornecedor({
    fornecedoresRepositorio,
    transacao,
    relogio,
    idPorta,
  });

  const resultado = await criarFornecedor({
    locatarioId: ctx.locatarioId,
    ...bodyParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      fornecedorId: resultado.value.fornecedorId,
    },
  });
}

export async function atualizarFornecedorController(request: FastifyRequest<{ Params: FornecedorIdParamsDto; Body: AtualizarFornecedorBodyDto; }>, reply: FastifyReply) {
  const paramsParse = parseFornecedorIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAtualizarFornecedorBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { fornecedoresRepositorio, transacao, relogio } =
    criarDepsFornecedores();

  const atualizarFornecedor = createFnAtualizarFornecedor({
    fornecedoresRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atualizarFornecedor({
    locatarioId: ctx.locatarioId,
    fornecedorId: paramsParse.data.id,
    ...bodyParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toFornecedorResponseDto(resultado.value.fornecedor),
  });
}

export async function excluirFornecedorController(
  request: FastifyRequest<{ Params: FornecedorIdParamsDto }>,
  reply: FastifyReply,
) {
  const paramsParse = parseFornecedorIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { fornecedoresRepositorio, transacao, relogio } =
    criarDepsFornecedores();

  const excluirFornecedor = createFnExcluirFornecedor({
    fornecedoresRepositorio,
    transacao,
    relogio,
  });

  const resultado = await excluirFornecedor({
    locatarioId: ctx.locatarioId,
    fornecedorId: paramsParse.data.id,
    excluidoPor: ctx.usuarioId ?? null,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toFornecedorResponseDto(resultado.value.fornecedor),
  });
}