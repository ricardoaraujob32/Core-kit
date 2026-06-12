// apps/api/src/modules/assinaturas/assinaturaModulos.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import { createErroApp, createFnDesvincularModuloDaAssinatura, createFnListarModulosHabilitados, createFnVincularModuloNaAssinatura, metaAcao, Permissoes } from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createAuthHttpRuntime } from "../../infra/prisma/auth/index.js";
import { createModulosHabilitadosRepositorio } from "../../infra/prisma/auth/assinatura/modulosHabilitadosRepositorioPrisma.js";
import { createAssinaturasRepositorioPrisma } from "../../infra/prisma/assinaturas/assinaturasRepositorioPrisma.js";
import { createAssinaturasModulosRepositorioPrisma } from "../../infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.js";
import { createModulosConsultaRepositorioPrisma } from "../../infra/prisma/assinaturas/modulosConsultaRepositorioPrisma.js";
import { parseModuloIdParams, parseVincularModuloAssinaturaBody } from "./assinaturaModulos.dto.js";
import type { ModuloIdParamsDto, VincularModuloAssinaturaBodyDto } from "./assinaturaModulos.dto.js";
import { toModuloHabilitadoDto, toVinculoModuloDto } from "./assinaturaModulos.presenter.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";

function criarDepsAssinaturaModulos() {
  return {
    assinaturasRepositorio: createAssinaturasRepositorioPrisma(clientePrisma),
    assinaturasModulosRepositorio: createAssinaturasModulosRepositorioPrisma(clientePrisma),
    modulosConsultaRepositorio: createModulosConsultaRepositorioPrisma(clientePrisma),
    modulosHabilitadosRepositorio: createModulosHabilitadosRepositorio(clientePrisma),
    relogio: getAuthBootstrap().runtime.technical.relogio,
    transacao: getAuthBootstrap().runtime.transacao,
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
      operacao: "http.assinaturaModulos.validacao",
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
export async function listarMeusModulosAssinaturaController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_ASSINATURA_LER,
    modulo: "ASSINATURAS",
  });
  if (!ctx) return;

  const { modulosHabilitadosRepositorio } = criarDepsAssinaturaModulos();

  const listarModulosHabilitados = createFnListarModulosHabilitados({
    repositorio: modulosHabilitadosRepositorio,
  });

  const resultado = await listarModulosHabilitados({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    locatarioId: resultado.value.locatarioId,
    modulos: resultado.value.modulos.map(toModuloHabilitadoDto),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function vincularModuloNaMinhaAssinaturaController(request: FastifyRequest<{ Body: VincularModuloAssinaturaBodyDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_ASSINATURA_ATUALIZAR,
    modulo: "ASSINATURAS",
  });
  if (!ctx) return;

  const bodyParse = parseVincularModuloAssinaturaBody(request.body);
  if (!bodyParse.success) return responderErroValidacao(reply, bodyParse);

  const deps = criarDepsAssinaturaModulos();
  const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(ctx.locatarioId);

  if (!assinaturaAtiva.ok) return sendHttpError(reply, assinaturaAtiva.error);

  if (!assinaturaAtiva.value) {
    return sendHttpError(reply, {
      codigo: "ASSINATURA_NAO_ENCONTRADA",
      mensagem: "Nenhuma assinatura ativa encontrada para este locatário.",
      detalhes: {
        locatarioId: ctx.locatarioId,
      },
    });
  }

  const vincularModuloNaAssinatura = createFnVincularModuloNaAssinatura({
    assinaturasRepositorio: deps.assinaturasRepositorio,
    assinaturasModulosRepositorio: deps.assinaturasModulosRepositorio,
    modulosConsultaRepositorio: deps.modulosConsultaRepositorio,
    relogio: deps.relogio,
    transacao: deps.transacao,
  });

  const resultado = await vincularModuloNaAssinatura({
    assinaturaId: assinaturaAtiva.value.assinaturaId,
    moduloId: bodyParse.data.moduloId,
  });

  await auditarController(request, ctx, {
    evento: "assinatura.modulo.vinculado",
    sucesso: resultado.ok,
    entidadeTipo: "assinatura_modulo",
    entidadeId: bodyParse.data.moduloId,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      assinaturaId: assinaturaAtiva.value.assinaturaId,
      moduloId: bodyParse.data.moduloId,
    }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(201).send({
    item: toVinculoModuloDto({
      assinaturaId: resultado.value.assinaturaId,
      moduloId: resultado.value.moduloId,
      origem: resultado.value.origem,
      gratuito: resultado.value.gratuito,
      habilitadoEm: resultado.value.habilitadoEm,
      desabilitadoEm: null,
    }),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function desvincularModuloDaMinhaAssinaturaController(request: FastifyRequest<{ Params: ModuloIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: Permissoes.TENANT_ASSINATURA_ATUALIZAR,
    modulo: "ASSINATURAS",
  });
  if (!ctx) return;

  const paramsParse = parseModuloIdParams(request.params);
  if (!paramsParse.success) return responderErroValidacao(reply, paramsParse);

  const deps = criarDepsAssinaturaModulos();
  const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(ctx.locatarioId);

  if (!assinaturaAtiva.ok) return sendHttpError(reply, assinaturaAtiva.error);

  if (!assinaturaAtiva.value) {
    return sendHttpError(reply, {
      codigo: "ASSINATURA_NAO_ENCONTRADA",
      mensagem: "Nenhuma assinatura ativa encontrada para este locatário.",
      detalhes: {
        locatarioId: ctx.locatarioId,
      },
    });
  }

  const desvincularModuloDaAssinatura = createFnDesvincularModuloDaAssinatura({
    assinaturasRepositorio: deps.assinaturasRepositorio,
    assinaturasModulosRepositorio: deps.assinaturasModulosRepositorio,
    relogio: deps.relogio,
    transacao: deps.transacao,
  });

  const resultado = await desvincularModuloDaAssinatura({
    assinaturaId: assinaturaAtiva.value.assinaturaId,
    moduloId: paramsParse.data.moduloId,
  });

  await auditarController(request, ctx, {
    evento: "assinatura.modulo.desvinculado",
    sucesso: resultado.ok,
    entidadeTipo: "assinatura_modulo",
    entidadeId: paramsParse.data.moduloId,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      assinaturaId: assinaturaAtiva.value.assinaturaId,
      moduloId: paramsParse.data.moduloId,
    }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    item: {
      assinaturaId: resultado.value.assinaturaId,
      moduloId: resultado.value.moduloId,
      desabilitadoEm: resultado.value.desabilitadoEm.toISOString(),
    },
  });
}
