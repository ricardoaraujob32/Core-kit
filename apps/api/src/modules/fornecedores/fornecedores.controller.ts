// apps/api/src/modules/fornecedores/fornecedores.controller.ts

import { createFnAtualizarFornecedor, createFnCriarFornecedor, createFnExcluirFornecedor, createFnListarFornecedores, createFnObterFornecedor, metaAcao } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { createFornecedoresRepositorio } from "../../infra/prisma/fornecedores/fornecedoresRepositorioPrisma.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createAuthHttpRuntime } from "../../infra/prisma/auth/index.js";
import { AtualizarFornecedorBodyDto, CriarFornecedorBodyDto, FornecedorIdParamsDto, parseAtualizarFornecedorBody, parseCriarFornecedorBody, parseFornecedorIdParams } from "./fornecedores.dto.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { toFornecedorResponseDto, toListarFornecedoresResponseDto } from "./fornecedores.presenter.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";

function criarDepsFornecedores() {
  return {
    fornecedoresRepositorio: createFornecedoresRepositorio(clientePrisma),
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
      operacao: "http.fornecedores.validacao",
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
export async function listarFornecedoresController(request: FastifyRequest, reply: FastifyReply) {
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
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

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
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

  await auditarController(request, ctx, {
    evento: "fornecedor.criado",
    sucesso: resultado.ok,
    entidadeTipo: "fornecedor",
    entidadeId: resultado.ok ? resultado.value.fornecedorId : null,
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
      fornecedorId: resultado.value.fornecedorId,
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
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

  await auditarController(request, ctx, {
    evento: "fornecedor.atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "fornecedor",
    entidadeId: paramsParse.data.id,
    entidadeNome: resultado.ok ? resultado.value.fornecedor.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      fornecedorId: paramsParse.data.id,
      alteracoes: bodyParse.data,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toFornecedorResponseDto(resultado.value.fornecedor),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function excluirFornecedorController(request: FastifyRequest<{ Params: FornecedorIdParamsDto }>, reply: FastifyReply) {
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

  await auditarController(request, ctx, {
    evento: "fornecedor.excluido",
    sucesso: resultado.ok,
    entidadeTipo: "fornecedor",
    entidadeId: paramsParse.data.id,
    entidadeNome: resultado.ok ? resultado.value.fornecedor.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ fornecedorId: paramsParse.data.id }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toFornecedorResponseDto(resultado.value.fornecedor),
  });
}