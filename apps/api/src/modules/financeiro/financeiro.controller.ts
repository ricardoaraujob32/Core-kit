// apps/api/src/modules/financeiro/financeiro.controller.ts

import type { FastifyReply, FastifyRequest } from "fastify";
import {
  createFnListarContasPagar,
  createFnListarContasReceber,
  createFnObterResumoFinanceiro,
  metaAcao,
  type Permissao,
} from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createFinanceiroTransacoesConsultaRepositorioPrisma } from "../../infra/prisma/financeiro/financeiroTransacoesConsultaRepositorioPrisma.js";
import { auditarController } from "../auditoria/auditarController.js";
import { responderErroValidacaoZod } from "../helpersValidacao.js";
import { parseFinanceiroQuery, type FinanceiroQueryDto } from "./financeiro.dto.js";
import { toContaFinanceiraDto, toResumoFinanceiroDto } from "./financeiro.presenter.js";

const PERMISSAO_FINANCEIRO_LER = "tenant.financeiro.ler" as Permissao;
const MODULO_FINANCEIRO = "FINANCEIRO";

function criarDepsFinanceiro() {
  return {
    financeiroRepositorio: createFinanceiroTransacoesConsultaRepositorioPrisma(clientePrisma),
  };
}

export async function obterResumoFinanceiroController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSAO_FINANCEIRO_LER,
    modulo: MODULO_FINANCEIRO,
  });
  if (!ctx) return;

  const obterResumoFinanceiro = createFnObterResumoFinanceiro(criarDepsFinanceiro());

  const resultado = await obterResumoFinanceiro({
    locatarioId: ctx.locatarioId,
  });

  await auditarController(request, ctx, {
    evento: "financeiro.resumo.obtido",
    sucesso: resultado.ok,
    entidadeTipo: "financeiro",
    entidadeId: null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({}),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    item: toResumoFinanceiroDto(resultado.value.resumo),
  });
}

function montarInputListagem(ctxLocatarioId: string, query: FinanceiroQueryDto) {
  return {
    locatarioId: ctxLocatarioId,
    status: query.status,
    vencidas: query.vencidas,
    dataInicial: query.dataInicial ?? null,
    dataFinal: query.dataFinal ?? null,
    cursor: query.cursor,
    limite: query.limite,
  };
}

export async function listarContasReceberController(request: FastifyRequest<{ Querystring: FinanceiroQueryDto }>, reply: FastifyReply) {
  const queryParse = parseFinanceiroQuery(request.query);
  if (!queryParse.success) return responderErroValidacaoZod(reply, queryParse, "http.financeiro.listarContasReceber.validacao");

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSAO_FINANCEIRO_LER,
    modulo: MODULO_FINANCEIRO,
  });
  if (!ctx) return;

  const listarContasReceber = createFnListarContasReceber(criarDepsFinanceiro());
  const resultado = await listarContasReceber(montarInputListagem(ctx.locatarioId, queryParse.data));

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    itens: resultado.value.itens.map(toContaFinanceiraDto),
  });
}

export async function listarContasPagarController(request: FastifyRequest<{ Querystring: FinanceiroQueryDto }>, reply: FastifyReply) {
  const queryParse = parseFinanceiroQuery(request.query);
  if (!queryParse.success) return responderErroValidacaoZod(reply, queryParse, "http.financeiro.listarContasPagar.validacao");

  const ctx = await autorizarHttp(request, reply, {
    permissao: PERMISSAO_FINANCEIRO_LER,
    modulo: MODULO_FINANCEIRO,
  });
  if (!ctx) return;

  const listarContasPagar = createFnListarContasPagar(criarDepsFinanceiro());
  const resultado = await listarContasPagar(montarInputListagem(ctx.locatarioId, queryParse.data));

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({
    itens: resultado.value.itens.map(toContaFinanceiraDto),
  });
}
