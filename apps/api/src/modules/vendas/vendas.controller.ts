// apps/api/src/modules/vendas/vendas.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { createFnAdicionarItemTransacao, createFnAtualizarItemTransacao, createFnCancelarTransacao, createFnConfirmarTransacao, createFnCriarCompra,
  createFnCriarVenda, createFnListarTransacoes, createFnObterTransacao, createFnRemoverItemTransacao, 
  metaAcao} from "@core-kit/core";
import { clientePrisma } from "../../infra/prisma/client";
import { createEstoquePadraoConsultaPortaPrisma, createProdutoComercialConsultaPortaPrisma, createVendasRepositorio } from "../../infra/prisma/vendas/vendasRepositorioPrisma";
import { createProdutosRepositorio } from "../../infra/prisma/produtos/produtosRepositorioPrisma";
import { createClientesRepositorio } from "../../infra/prisma/clientes/clientesRepositorioPrisma";
import { createFornecedoresRepositorio } from "../../infra/prisma/fornecedores/fornecedoresRepositorioPrisma";
import { sendHttpError } from "../../http/serializarErroApp";
import { autorizarHttp } from "../../http/autorizarHttp";
import { parseAdicionarItemTransacaoBody, parseAtualizarItemTransacaoBody, parseCancelarTransacaoBody, parseCriarCompraBody, parseCriarVendaBody, 
  parseItemTransacaoIdParams, parseTransacaoIdParams } from "./vendas.dto";
import type { AdicionarItemTransacaoBodyDto, AtualizarItemTransacaoBodyDto, CancelarTransacaoBodyDto, CriarCompraBodyDto, CriarVendaBodyDto, ItemTransacaoIdParamsDto,
  TransacaoIdParamsDto } from "./vendas.dto";
import { toListarTransacoesResponseDto, toTransacaoDetalhadaResponseDto, toTransacaoResponseDto } from "./vendas.presenter";
import { auditarController } from "../auditoria/auditarController";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap";

function criarDepsVendasBase() {
  return {
    vendasRepositorio: createVendasRepositorio(clientePrisma),
    transacao: getAuthBootstrap().runtime.transacao,
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
  };
}

function criarDepsAdicionarItemTransacao(): Parameters<typeof createFnAdicionarItemTransacao>[0] {
  return {
    ...criarDepsVendasBase(),
    produtosConsulta: createProdutoComercialConsultaPortaPrisma(clientePrisma),
    estoquePadraoConsulta: createEstoquePadraoConsultaPortaPrisma(clientePrisma),
  };
}

function responderErroValidacao(reply: FastifyReply,
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
      operacao: "http.vendas.validacao",
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
export async function listarTransacoesController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { vendasRepositorio } = criarDepsVendasBase();

  const listarTransacoes = createFnListarTransacoes({
    vendasRepositorio,
  });

  const resultado = await listarTransacoes({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarTransacoesResponseDto(resultado.value.itens),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function obterTransacaoController(request: FastifyRequest<{ Params: TransacaoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { vendasRepositorio } = criarDepsVendasBase();

  const obterTransacao = createFnObterTransacao({
    vendasRepositorio,
  });

  const resultado = await obterTransacao({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toTransacaoDetalhadaResponseDto({
      transacao: resultado.value.transacao,
      itens: resultado.value.itens,
    }),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarVendaController(request: FastifyRequest<{ Body: CriarVendaBodyDto }>, reply: FastifyReply) {
  const bodyParse = parseCriarVendaBody(request.body ?? {});
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const criarVenda = createFnCriarVenda(criarDepsVendasBase());

  const resultado = await criarVenda({
    locatarioId: ctx.locatarioId,
    clienteId: bodyParse.data.clienteId ?? null,
    observacao: bodyParse.data.observacao ?? null,
  });

  await auditarController(request, ctx, {
    evento: "transacao.venda.criada",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: resultado.ok ? resultado.value.transacaoId : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: bodyParse.data }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      transacaoId: resultado.value.transacaoId,
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarCompraController(request: FastifyRequest<{ Body: CriarCompraBodyDto }>, reply: FastifyReply) {
  const bodyParse = parseCriarCompraBody(request.body ?? {});
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const criarCompra = createFnCriarCompra(criarDepsVendasBase());

  const resultado = await criarCompra({
    locatarioId: ctx.locatarioId,
    fornecedorId: bodyParse.data.fornecedorId ?? null,
    observacao: bodyParse.data.observacao ?? null,
  });

  await auditarController(request, ctx, {
    evento: "transacao.compra.criada",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: resultado.ok ? resultado.value.transacaoId : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: bodyParse.data }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: {
      transacaoId: resultado.value.transacaoId,
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function adicionarItemTransacaoController(request: FastifyRequest<{ Params: TransacaoIdParamsDto; Body: AdicionarItemTransacaoBodyDto;}>, reply: FastifyReply) {
  const paramsParse = parseTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAdicionarItemTransacaoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const adicionarItemTransacao = createFnAdicionarItemTransacao(
    criarDepsAdicionarItemTransacao(),
  );

  const resultado = await adicionarItemTransacao({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
    produtoId: bodyParse.data.produtoId,
    estoqueId: bodyParse.data.estoqueId ?? null,
    quantidade: bodyParse.data.quantidade,
    valorUnitario: bodyParse.data.valorUnitario,
    valorDesconto: bodyParse.data.valorDesconto,
  });

  await auditarController(request, ctx, {
    evento: "transacao.item_adicionado",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: paramsParse.data.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      transacaoId: paramsParse.data.id,
      body: bodyParse.data,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: resultado.value.item,
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function atualizarItemTransacaoController(request: FastifyRequest<{ Params: ItemTransacaoIdParamsDto; Body: AtualizarItemTransacaoBodyDto; }>, reply: FastifyReply) {
  const paramsParse = parseItemTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseAtualizarItemTransacaoBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const atualizarItemTransacao = createFnAtualizarItemTransacao(criarDepsVendasBase());

  const resultado = await atualizarItemTransacao({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
    itemTransacaoId: paramsParse.data.itemId,
    descricao: bodyParse.data.descricao,
    quantidade: bodyParse.data.quantidade,
    valorUnitario: bodyParse.data.valorUnitario,
    valorDesconto: bodyParse.data.valorDesconto,
  });

  await auditarController(request, ctx, {
    evento: "transacao.item_atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: paramsParse.data.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      transacaoId: paramsParse.data.id,
      itemTransacaoId: paramsParse.data.itemId,
      alteracoes: bodyParse.data,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: {
      item: resultado.value.item,
      transacao: toTransacaoResponseDto(resultado.value.transacao),
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function removerItemTransacaoController(request: FastifyRequest<{ Params: ItemTransacaoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseItemTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const removerItem = createFnRemoverItemTransacao(criarDepsVendasBase());

  const resultado = await removerItem({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
    itemTransacaoId: paramsParse.data.itemId,
  });

  await auditarController(request, ctx, {
    evento: "transacao.item_removido",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: paramsParse.data.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      transacaoId: paramsParse.data.id,
      itemTransacaoId: paramsParse.data.itemId,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toTransacaoResponseDto(resultado.value.transacao),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function confirmarTransacaoController(request: FastifyRequest<{ Params: TransacaoIdParamsDto }>, reply: FastifyReply) {
  const paramsParse = parseTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const confirmarTransacao = createFnConfirmarTransacao(criarDepsVendasBase());

  const resultado = await confirmarTransacao({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
    usuarioId: ctx.usuarioId ?? null,
  });

  await auditarController(request, ctx, {
    evento: "transacao.confirmada",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: paramsParse.data.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ transacaoId: paramsParse.data.id }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toTransacaoResponseDto(resultado.value.transacao),
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function cancelarTransacaoController(request: FastifyRequest<{ Params: TransacaoIdParamsDto; Body: CancelarTransacaoBodyDto; }>, reply: FastifyReply) {
  const paramsParse = parseTransacaoIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacao(reply, paramsParse);
  }

  const bodyParse = parseCancelarTransacaoBody(request.body ?? {});
  if (!bodyParse.success) {
    return responderErroValidacao(reply, bodyParse);
  }

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const cancelarTransacao = createFnCancelarTransacao(criarDepsVendasBase());

  const resultado = await cancelarTransacao({
    locatarioId: ctx.locatarioId,
    transacaoId: paramsParse.data.id,
    motivo: bodyParse.data.motivo ?? null,
    usuarioId: ctx.usuarioId ?? null,
  });

  await auditarController(request, ctx, {
    evento: "transacao.cancelada",
    sucesso: resultado.ok,
    entidadeTipo: "transacao",
    entidadeId: paramsParse.data.id,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      transacaoId: paramsParse.data.id,
      motivo: bodyParse.data.motivo ?? null,
    }),
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: toTransacaoResponseDto(resultado.value.transacao),
  });
}
