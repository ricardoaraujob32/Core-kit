import type { FastifyReply, FastifyRequest } from "fastify";
import type { Permissao } from "@core-kit/core";
import {
  createFnAguardarOrdemServico,
  createFnAtualizarOrdemServico,
  createFnCancelarOrdemServico,
  createFnConcluirOrdemServico,
  createFnCriarOrdemServico,
  createFnGerarVendaDaOrdemServico,
  createFnIniciarOrdemServico,
  createFnListarOrdensServico,
  createFnObterOrdemServico,
} from "@core-kit/core";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import { createOrdensServicoRepositorioPrisma } from "../../infra/prisma/ordensServico/ordensServicoRepositorioPrisma.js";
import {
  parseAtualizarOrdemServicoBody,
  parseCriarOrdemServicoBody,
  parseGerarVendaOrdemServicoBody,
  parseListarOrdensServicoQuery,
  parseOrdemServicoIdParams,
  type AtualizarOrdemServicoBodyDto,
  type CriarOrdemServicoBodyDto,
  type GerarVendaOrdemServicoBodyDto,
  type ListarOrdensServicoQueryDto,
  type OrdemServicoIdParamsDto,
} from "./ordensServico.dto.js";
import { toOrdemServicoDto } from "./ordensServico.presenter.js";

const PERMISSOES = {
  ler: "tenant.ordens_servico.ler" as Permissao,
  criar: "tenant.ordens_servico.criar" as Permissao,
  atualizar: "tenant.ordens_servico.atualizar" as Permissao,
  cancelar: "tenant.ordens_servico.cancelar" as Permissao,
  concluir: "tenant.ordens_servico.concluir" as Permissao,
  gerarVenda: "tenant.ordens_servico.gerar_venda" as Permissao,
};

function deps() {
  return {
    ordensServicoRepositorio: createOrdensServicoRepositorioPrisma(clientePrisma),
    relogio: getAuthBootstrap().runtime.technical.relogio,
    transacao: getAuthBootstrap().runtime.transacao,
  };
}

function responderErroValidacao(reply: FastifyReply, parseResult: { error: { flatten: () => { fieldErrors: Record<string, string[] | undefined>; formErrors: string[] } } }) {
  const { fieldErrors, formErrors } = parseResult.error.flatten();
  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: formErrors[0] ?? "Dados inválidos na requisição.",
    detalhes: { campos: fieldErrors, formulario: formErrors },
  });
}

export async function listarOrdensServicoController(request: FastifyRequest<{ Querystring: ListarOrdensServicoQueryDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, { permissao: PERMISSOES.ler, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;

  const query = parseListarOrdensServicoQuery(request.query);
  if (!query.success) return responderErroValidacao(reply, query);

  const listar = createFnListarOrdensServico(deps());
  const resultado = await listar({
    locatarioId: ctx.locatarioId,
    status: query.data.status,
    clienteId: query.data.clienteId,
    cursor: query.data.cursor,
    limite: query.data.limite,
  });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ itens: resultado.value.itens.map(toOrdemServicoDto) });
}

export async function criarOrdemServicoController(request: FastifyRequest<{ Body: CriarOrdemServicoBodyDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, { permissao: PERMISSOES.criar, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;

  const body = parseCriarOrdemServicoBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body);

  const criar = createFnCriarOrdemServico(deps());
  const resultado = await criar({
    locatarioId: ctx.locatarioId,
    clienteId: body.data.clienteId,
    servicoId: body.data.servicoId ?? null,
    titulo: body.data.titulo,
    descricao: body.data.descricao,
    usuarioId: ctx.usuarioId,
  });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(201).send({ item: toOrdemServicoDto(resultado.value.ordemServico) });
}

export async function obterOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, { permissao: PERMISSOES.ler, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;

  const params = parseOrdemServicoIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const obter = createFnObterOrdemServico(deps());
  const resultado = await obter({ locatarioId: ctx.locatarioId, ordemServicoId: params.data.ordemServicoId });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: toOrdemServicoDto(resultado.value.ordemServico) });
}

export async function atualizarOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto; Body: AtualizarOrdemServicoBodyDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, { permissao: PERMISSOES.atualizar, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;

  const params = parseOrdemServicoIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);
  const body = parseAtualizarOrdemServicoBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body);

  const atualizar = createFnAtualizarOrdemServico(deps());
  const resultado = await atualizar({
    locatarioId: ctx.locatarioId,
    ordemServicoId: params.data.ordemServicoId,
    clienteId: body.data.clienteId,
    servicoId: body.data.servicoId,
    titulo: body.data.titulo,
    descricao: body.data.descricao,
    usuarioId: ctx.usuarioId,
  });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: toOrdemServicoDto(resultado.value.ordemServico) });
}

async function mudarStatus(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply, permissao: Permissao, factory: ReturnType<typeof createFnIniciarOrdemServico> | ReturnType<typeof createFnAguardarOrdemServico> | ReturnType<typeof createFnConcluirOrdemServico> | ReturnType<typeof createFnCancelarOrdemServico>) {
  const ctx = await autorizarHttp(request, reply, { permissao, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;
  const params = parseOrdemServicoIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);

  const resultado = await factory({ locatarioId: ctx.locatarioId, ordemServicoId: params.data.ordemServicoId, usuarioId: ctx.usuarioId });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);
  return reply.status(200).send({ item: toOrdemServicoDto(resultado.value.ordemServico) });
}

export async function iniciarOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply) {
  return mudarStatus(request, reply, PERMISSOES.atualizar, createFnIniciarOrdemServico(deps()));
}

export async function aguardarOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply) {
  return mudarStatus(request, reply, PERMISSOES.atualizar, createFnAguardarOrdemServico(deps()));
}

export async function concluirOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply) {
  return mudarStatus(request, reply, PERMISSOES.concluir, createFnConcluirOrdemServico(deps()));
}

export async function cancelarOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto }>, reply: FastifyReply) {
  return mudarStatus(request, reply, PERMISSOES.cancelar, createFnCancelarOrdemServico(deps()));
}

export async function gerarVendaDaOrdemServicoController(request: FastifyRequest<{ Params: OrdemServicoIdParamsDto; Body: GerarVendaOrdemServicoBodyDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, { permissao: PERMISSOES.gerarVenda, modulo: "ORDENS_SERVICO" });
  if (!ctx) return;

  const params = parseOrdemServicoIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params);
  const body = parseGerarVendaOrdemServicoBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body);

  const gerarVenda = createFnGerarVendaDaOrdemServico(deps());
  const resultado = await gerarVenda({
    locatarioId: ctx.locatarioId,
    ordemServicoId: params.data.ordemServicoId,
    produtoId: body.data.produtoId ?? null,
    valorTotal: body.data.valorTotal,
    vencimentoEm: body.data.vencimentoEm,
    observacao: body.data.observacao,
    usuarioId: ctx.usuarioId,
  });
  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(201).send({
    item: toOrdemServicoDto(resultado.value.ordemServico),
    transacaoId: resultado.value.transacaoId,
  });
}
