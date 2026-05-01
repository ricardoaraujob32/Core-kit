// apps/api/src/modules/produtos/produtos.controller.ts

import { createFnAtualizarProduto, createFnCriarProduto, createFnExcluirProduto, createFnListarProdutos, createFnObterProduto } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp";
import { sendHttpError } from "../../http/serializarErroApp";
import { createProdutosRepositorio } from "../../infra/prisma/produtos/produtosRepositorioPrisma";
import { clientePrisma } from "../../infra/prisma/client";
import { createAuthHttpRuntime } from "../../infra/prisma/auth";
import { AtualizarProdutoBodyDto, CriarProdutoBodyDto, parseAtualizarProdutoBody, parseCriarProdutoBody, parseProdutoIdParams, ProdutoIdParamsDto } from "./produtos.dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { toListarProdutosResponseDto, toProdutoResponseDto } from "./produtos.presenter";

const authRuntime = createAuthHttpRuntime();

function criarDepsProdutos() {
  return {
    produtosRepositorio: createProdutosRepositorio(clientePrisma),
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
      operacao: "http.produtos.validacao",
      campos: fieldErrors,
      formulario: formErrors,
    },
  });
}

export async function listarProdutosController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { produtosRepositorio } = criarDepsProdutos();

  const listarProdutos = createFnListarProdutos({
    produtosRepositorio,
  });

  const resultado = await listarProdutos({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarProdutosResponseDto(resultado.value.itens),
  });
}

export async function obterProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { produtosRepositorio } = criarDepsProdutos();

  const obterProduto = createFnObterProduto({
    produtosRepositorio,
  });

  const resultado = await obterProduto({
    locatarioId: ctx.locatarioId,
    produtoId: paramsParse.data.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toProdutoResponseDto(resultado.value.produto),
  });
}

export async function criarProdutoController(request: FastifyRequest<{ Body: CriarProdutoBodyDto }>, reply: FastifyReply) {
  const bodyParse = parseCriarProdutoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { produtosRepositorio, transacao, relogio, idPorta } =
    criarDepsProdutos();

  const criarProduto = createFnCriarProduto({
    produtosRepositorio,
    transacao,
    relogio,
    idPorta,
  });

  const resultado = await criarProduto({
    locatarioId: ctx.locatarioId,
    ...bodyParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      produtoId: resultado.value.produtoId,
    },
  });
}

export async function atualizarProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto; Body: AtualizarProdutoBodyDto; }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAtualizarProdutoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { produtosRepositorio, transacao, relogio } = criarDepsProdutos();

  const atualizarProduto = createFnAtualizarProduto({
    produtosRepositorio,
    transacao,
    relogio,
  });

  const resultado = await atualizarProduto({
    locatarioId: ctx.locatarioId,
    produtoId: paramsParse.data.id,
    ...bodyParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toProdutoResponseDto(resultado.value.produto),
  });
}

export async function excluirProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { produtosRepositorio, transacao, relogio } = criarDepsProdutos();

  const excluirProduto = createFnExcluirProduto({
    produtosRepositorio,
    transacao,
    relogio,
  });

  const resultado = await excluirProduto({
    locatarioId: ctx.locatarioId,
    produtoId: paramsParse.data.id,
    excluidoPor: ctx.usuarioId ?? null,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toProdutoResponseDto(resultado.value.produto),
  });
}