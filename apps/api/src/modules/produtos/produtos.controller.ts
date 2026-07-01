// apps/api/src/modules/produtos/produtos.controller.ts

import { createFnAtualizarProduto, createFnCriarProduto, createFnExcluirProduto, createFnListarProdutos, createFnObterProduto, metaAcao } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { createProdutosRepositorio } from "../../infra/prisma/produtos/produtosRepositorioPrisma.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createAuthHttpRuntime } from "../../infra/prisma/auth/index.js";
import { AtualizarProdutoBodyDto, CriarProdutoBodyDto, parseAtualizarProdutoBody, parseCriarProdutoBody, parseProdutoIdParams, ProdutoIdParamsDto } from "./produtos.dto.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { toListarProdutosResponseDto, toProdutoResponseDto } from "./produtos.presenter.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import type { Permissao } from "@core-kit/core";

const MODULO = "VENDAS" as const;
const PERMISSOES = {
  listar: "tenant.produto.listar" as Permissao,
  criar: "tenant.produto.criar" as Permissao,
  atualizar: "tenant.produto.atualizar" as Permissao,
  excluir: "tenant.produto.excluir" as Permissao,
};

function criarDepsProdutos() {
  return {
    produtosRepositorio: createProdutosRepositorio(clientePrisma),
    transacao: getAuthBootstrap().runtime.transacao,
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function listarProdutosController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.listar,
    modulo: MODULO,
  });
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function obterProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.listar,
    modulo: MODULO,
  });
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarProdutoController(request: FastifyRequest<{ Body: CriarProdutoBodyDto }>, reply: FastifyReply) {
  const bodyParse = parseCriarProdutoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.criar,
    modulo: MODULO,
  });
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

  await auditarController(request, ctx, {
    evento: "produto.criado",
    sucesso: resultado.ok,
    entidadeTipo: "produto",
    entidadeId: resultado.ok ? resultado.value.produtoId : null,
    entidadeNome: bodyParse.data.nome,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: bodyParse.data }),
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function atualizarProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto; Body: AtualizarProdutoBodyDto; }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAtualizarProdutoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.atualizar,
    modulo: MODULO,
  });
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

  await auditarController(request, ctx, {
    evento: "produto.atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "produto",
    entidadeId: paramsParse.data.id,
    entidadeNome: resultado.ok ? resultado.value.produto.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      produtoId: paramsParse.data.id,
      alteracoes: bodyParse.data,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toProdutoResponseDto(resultado.value.produto),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function excluirProdutoController(request: FastifyRequest<{ Params: ProdutoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseProdutoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSOES.excluir,
    modulo: MODULO,
  });
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

  await auditarController(request, ctx, {
    evento: "produto.excluido",
    sucesso: resultado.ok,
    entidadeTipo: "produto",
    entidadeId: paramsParse.data.id,
    entidadeNome: resultado.ok ? resultado.value.produto.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ produtoId: paramsParse.data.id }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toProdutoResponseDto(resultado.value.produto),
  });
}
