// apps/api/src/modules/locatarios/locatarios.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp.js";
import { clientePrisma } from "../../infra/prisma/client.js";
import { createFnAtivarConfiguracaoLocatario, createFnAtualizarConfiguracaoLocatario, createFnAtualizarLocatario, createFnCriarConfiguracaoLocatario, 
  createFnCriarLocatario, createFnDesvincularModuloDaAssinatura, createFnEncerrarLocatario, createFnListarLocatarios, createFnListarModulosHabilitadosLocatario, createFnObterLocatario, createFnReativarLocatario, createFnSuspenderLocatario, 
  createFnVincularModuloNaAssinatura, 
  metaAcao } from "@core-kit/core";
import { exigirMesmoLocatarioHttp } from "../../http/routeGuards.js";
//import { auditar } from "../auditoria/auditoria.dispatcher.instance.js";
import { criarContextoAuditoria } from "../auditoria/auditoria.helpers.js";
import { createLocatariosRepositorio } from "../../infra/prisma/locatarios/locatariosRepositorioPrisma.js";
import { AtualizarConfiguracaoBodyDto, AtualizarLocatarioBodyDto, ConfiguracaoIdOnlyParamsDto, ConfiguracaoIdParamsDto, CriarConfiguracaoBodyDto, CriarLocatarioBodyDto, EncerrarLocatarioBodyDto, 
  LocatarioIdParamsDto, ModuloIdParamsDto, parseAtualizarConfiguracaoBody, parseAtualizarLocatarioBody, parseConfiguracaoIdOnlyParams, parseConfiguracaoIdParams, parseCriarConfiguracaoBody, parseCriarLocatarioBody, 
  parseEncerrarLocatarioBody, parseLocatarioIdParams, parseModuloIdParams, parseReativarLocatarioBody, parseSuspenderLocatarioBody, parseVincularModuloAssinaturaBody, ReativarLocatarioBodyDto, 
  SuspenderLocatarioBodyDto, 
  VincularModuloAssinaturaBodyDto} from "./locatarios.dto.js";
import { autorizarHttp } from "../../http/autorizarHttp.js";
import { auditarController } from "../auditoria/auditarController.js";
import { getAuthBootstrap } from "../../bootstrap/authBootstrap.js";
import { autorizarPlataformaHttp } from "../../http/autorizarPlataformaHttp.js";
import { auditarControllerPlataforma } from "../auditoria/auditarControllerPlataforma.js";
import { createAssinaturasRepositorioPrisma } from "@core-kit/api/infra/prisma/assinaturas/assinaturasRepositorioPrisma";
import { createAssinaturasModulosRepositorioPrisma } from "@core-kit/api/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma";
import { createModulosConsultaRepositorioPrisma } from "@core-kit/api/infra/prisma/assinaturas/modulosConsultaRepositorioPrisma";
import { responderErroValidacaoZod } from "../helpersValidacao.js";

function criarDepsLocatarios() {
  const locatariosRepositorio = createLocatariosRepositorio(clientePrisma);

  return {
    locatariosRepositorio,
    transacao: getAuthBootstrap().runtime.transacao,
    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
  };
}

function criarDepsAssinaturas() {
  return {
    assinaturasRepositorio: createAssinaturasRepositorioPrisma(clientePrisma),
    assinaturasModulosRepositorio: createAssinaturasModulosRepositorioPrisma(clientePrisma),
    modulosConsultaRepositorio: createModulosConsultaRepositorioPrisma(clientePrisma),
    relogio: {
      agora: () => new Date(),
    },
  };
}

function responderErroValidacao(reply: FastifyReply, issues: Array<{ path: (string | number)[]; message: string }>) {
  return sendHttpError(reply, {
    codigo: "INVALIDO",
    mensagem: "Entrada inválida.",
    detalhes: {
      campos: issues.map((issue) => ({
        caminho: issue.path.join("."),
        mensagem: issue.message,
      })),
    },
  });
}

/* ===========================
 * SUPERADMIN
 * =========================== */

/**
 * Controller de listagem global de locatários.
 *
 * Uso restrito ao fluxo superadmin da borda HTTP.
 *
 * @param request Requisição Fastify autenticada.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function listarLocatariosPlataformaController(request: FastifyRequest, reply: FastifyReply) {
  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio } = criarDepsLocatarios();

  const listarLocatarios = createFnListarLocatarios({
    locatariosRepositorio: locatariosRepositorio,
  });

  const resultado = await listarLocatarios({});

  // await auditar(criarContextoAuditoria(request, ctx, { isSuperadmin: true }),
  //   {
  //     evento: "plataforma.locatario.listado",
  //     sucesso: resultado.ok,
  //     entidadeTipo: "locatario",
  //     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //     metadados: metaAcao({
  //       quantidadeResultados: resultado.ok
  //         ? Array.isArray(resultado.value)
  //           ? resultado.value.length
  //           : resultado.value.itens?.length ?? 0
  //         : 0,
  //     }),
  //   },
  // );

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ itens: resultado.value.itens });
}

/**
 * Controller de consulta global de locatário.
 *
 * Uso restrito ao fluxo superadmin da borda HTTP.
 *
 * @param request Requisição Fastify com `id` do locatário.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function obterLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto }>, reply: FastifyReply) {
  const params = parseLocatarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio } = criarDepsLocatarios();

  const obterLocatario = createFnObterLocatario({
    locatariosRepositorio: locatariosRepositorio,
  });

  const resultado = await obterLocatario({
    locatarioId: params.data.id,
  });

  // await auditar(criarContextoAuditoria(request, ctx, {
  //     isSuperadmin: true,
  //     locatarioAlvoId: request.params.id,
  //   }),
  //   {
  //     evento: "plataforma.locatario.obtido",
  //     sucesso: resultado.ok,
  //     entidadeTipo: "locatario",
  //     entidadeId: request.params.id,
  //     entidadeNome: resultado.ok
  //       ? (resultado.value as any).nome ?? (resultado.value as any).locatario ?? null
  //       : null,
  //     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //     metadados: metaAcao(),
  //   },
  // );

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarLocatarioPlataformaController(request: FastifyRequest<{ Body: CriarLocatarioBodyDto }>, reply: FastifyReply) {
  const body = parseCriarLocatarioBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio, relogio, idPorta, transacao } = criarDepsLocatarios();

  const criarLocatario = createFnCriarLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    idPorta,
    transacao,
  });

  const resultado = await criarLocatario(body.data);

  await auditarControllerPlataforma(request, plataforma, {
    evento: "plataforma.locatario.criado",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    entidadeId: resultado.ok ? resultado.value.locatarioId : null,
    entidadeNome: body.data.nome,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(201).send({
    item: {
      locatarioId: resultado.value.locatarioId,
    },
  });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function atualizarLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: AtualizarLocatarioBodyDto }>, reply: FastifyReply) {
  const params = parseLocatarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseAtualizarLocatarioBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const atualizarLocatario = createFnAtualizarLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await atualizarLocatario({
    locatarioId: params.data.id,
    ...body.data,
  });

  await auditarControllerPlataforma(request, plataforma, {
    evento: "plataforma.locatario.atualizado",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    entidadeId: resultado.ok ? resultado.value.locatario.locatarioId : null,
    entidadeNome: body.data.nome,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function suspenderLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: SuspenderLocatarioBodyDto }>, reply: FastifyReply) {
  const params = parseLocatarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseSuspenderLocatarioBody(request.body ?? {});
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const suspenderLocatario = createFnSuspenderLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await suspenderLocatario({
    locatarioId: params.data.id,
    motivoSuspensao: body.data.motivoSuspensao,
  });

  await auditarControllerPlataforma(request, plataforma, {
    evento: "plataforma.locatario.suspenso",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    entidadeId: resultado.ok ? resultado.value.locatario.locatarioId : null,
    entidadeNome: resultado.ok ? resultado.value.locatario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function reativarLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: ReativarLocatarioBodyDto }>, reply: FastifyReply) {
  const params = parseLocatarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseReativarLocatarioBody(request.body ?? {});
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;  

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const reativarLocatario = createFnReativarLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await reativarLocatario({
    locatarioId: params.data.id,
    motivoReativacao: body.data.motivoReativacao,
  });

  await auditarControllerPlataforma(request, plataforma, {
    evento: "plataforma.locatario.reativado",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    entidadeId: resultado.ok ? resultado.value.locatario.locatarioId : null,
    entidadeNome: resultado.ok ? resultado.value.locatario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function encerrarLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: EncerrarLocatarioBodyDto }>, reply: FastifyReply) {
  const params = parseLocatarioIdParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseEncerrarLocatarioBody(request.body ?? {});
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const encerrarLocatario = createFnEncerrarLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await encerrarLocatario({
    locatarioId: params.data.id,
    motivoExclusao: body.data.motivoExclusao,
  });

  await auditarControllerPlataforma(request, plataforma, {
    evento: "plataforma.locatario.encerrado",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    entidadeId: resultado.ok ? resultado.value.locatario.locatarioId : null,
    entidadeNome: resultado.ok ? resultado.value.locatario.nome : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/* ===========================
 * PRÓPRIO LOCATÁRIO
 * =========================== */

/**
 * Controller do tenant admin:
 * só permite consultar o próprio locatário.
 *
 * @param request Requisição Fastify com `id` do locatário.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function obterMeuLocatarioController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio } = criarDepsLocatarios();

  const obterLocatario = createFnObterLocatario({
    locatariosRepositorio: locatariosRepositorio,
  });

  const resultado = await obterLocatario({
    locatarioId: ctx.locatarioId,
  });

  // await auditar(criarContextoAuditoria(request, ctx), {
  //   evento: "locatario.obtido",
  //   sucesso: resultado.ok,
  //   entidadeTipo: "locatario",
  //   entidadeId: request.params.id,
  //   entidadeNome: resultado.ok
  //     ? (resultado.value as any).locatario ?? (resultado.value as any).nome ?? null
  //     : null,
  //   erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //   erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //   metadados: metaAcao(),
  // });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.locatario });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function listarConfiguracoesLocatarioController(request: FastifyRequest<{ Params: LocatarioIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio } = criarDepsLocatarios();
  const resultado = await locatariosRepositorio.listarConfiguracoes({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ itens: resultado.value });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function obterConfiguracaoAtivaLocatarioController(request: FastifyRequest<{ Params: LocatarioIdParamsDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio } = criarDepsLocatarios();
  const resultado = await locatariosRepositorio.obterConfiguracaoAtiva({
    locatarioId: ctx.locatarioId,
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value });
}


/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function criarConfiguracaoLocatarioController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: CriarConfiguracaoBodyDto }>, reply: FastifyReply) {
  const body = parseCriarConfiguracaoBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio, relogio, idPorta, transacao } = criarDepsLocatarios();

  const criarConfiguracao = createFnCriarConfiguracaoLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    idPorta,
    transacao,
  });

  const resultado = await criarConfiguracao({
    locatarioId: ctx.locatarioId,
    ...body.data,
  });

  await auditarController(request, ctx, {
    evento: "locatario.configuracao.criada",
    sucesso: resultado.ok,
    entidadeTipo: "configuracao_locatario",
    entidadeId: resultado.ok ? resultado.value.configuracaoId ?? null : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(201).send({ item: resultado.value });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function atualizarConfiguracaoLocatarioController(request: FastifyRequest<{ Params: ConfiguracaoIdParamsDto; Body: AtualizarConfiguracaoBodyDto }>, reply: FastifyReply) {
  const params = parseConfiguracaoIdOnlyParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const body = parseAtualizarConfiguracaoBody(request.body);
  if (!body.success) return responderErroValidacao(reply, body.error.issues);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const atualizarConfiguracao = createFnAtualizarConfiguracaoLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await atualizarConfiguracao({
    locatarioId: ctx.locatarioId,
    configuracaoId: params.data.configuracaoId,
    ...body.data,
  });

  await auditarController(request, ctx, {
    evento: "locatario.configuracao.atualizada",
    sucesso: resultado.ok,
    entidadeTipo: "configuracao_locatario",
    entidadeId: resultado.ok ? resultado.value.configuracao.configuracaoId ?? null : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ body: body.data }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.configuracao });
}

/**
 * 
 * @param request 
 * @param reply 
 * @returns 
 */
export async function ativarConfiguracaoLocatarioController(request: FastifyRequest<{ Params: ConfiguracaoIdParamsDto }>, reply: FastifyReply) {
  const params = parseConfiguracaoIdOnlyParams(request.params);
  if (!params.success) return responderErroValidacao(reply, params.error.issues);

  const ctx = await autorizarHttp(request, reply);
  if (!ctx) return;

  const { locatariosRepositorio, relogio, transacao } = criarDepsLocatarios();

  const ativarConfiguracao = createFnAtivarConfiguracaoLocatario({
    locatariosRepositorio: locatariosRepositorio,
    relogio,
    transacao,
  });

  const resultado = await ativarConfiguracao({
    locatarioId: ctx.locatarioId,
    configuracaoId: params.data.configuracaoId,
  });

  await auditarController(request, ctx, {
    evento: "locatario.configuracao.ativada",
    sucesso: resultado.ok,
    entidadeTipo: "configuracao_locatario",
    entidadeId: resultado.ok ? resultado.value.configuracao.configuracaoId ?? null : null,
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({ configuracaoId: params.data.configuracaoId }),
  });

  if (!resultado.ok) return sendHttpError(reply, resultado.error);

  return reply.status(200).send({ item: resultado.value.configuracao });
}

export async function listarModulosLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto }>, reply: FastifyReply) {
  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const paramsParse = parseLocatarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacaoZod(reply, paramsParse, "http.plataforma.locatarios.modulos.params");
  }

  const listar = createFnListarModulosHabilitadosLocatario(criarDepsAssinaturas());

  const resultado = await listar({
    locatarioId: paramsParse.data.id,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}

export async function vincularModuloLocatarioPlataformaController(request: FastifyRequest<{ Params: LocatarioIdParamsDto; Body: VincularModuloAssinaturaBodyDto; }>, reply: FastifyReply) {
  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const paramsParse = parseLocatarioIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacaoZod(reply, paramsParse, "http.plataforma.locatarios.modulos.params");
  }

  const bodyParse = parseVincularModuloAssinaturaBody(request.body);
  if (!bodyParse.success) {
    return responderErroValidacaoZod(reply, bodyParse, "http.plataforma.locatarios.modulos.body");
  }

  const deps = criarDepsAssinaturas();

  const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(
    paramsParse.data.id,
  );

  if (!assinaturaAtiva.ok) {
    return sendHttpError(reply, assinaturaAtiva.error);
  }

  if (!assinaturaAtiva.value) {
    return sendHttpError(reply, {
      codigo: "ASSINATURA_NAO_ENCONTRADA",
      mensagem: "Locatário não possui assinatura ativa.",
      detalhes: {
        locatarioId: paramsParse.data.id,
        operacao: "http.plataforma.locatarios.modulos.vincular.assinaturaAtiva",
      },
    });
  }

  const vincular = createFnVincularModuloNaAssinatura(deps);

  const resultado = await vincular({
    assinaturaId: assinaturaAtiva.value.assinaturaId,
    moduloId: bodyParse.data.moduloId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(201).send({
    item: resultado.value,
  });
}

export async function desvincularModuloLocatarioPlataformaController(request: FastifyRequest<{ Params: ModuloIdParamsDto }>, reply: FastifyReply) {
  const plataforma = await autorizarPlataformaHttp(request, reply);
  if (!plataforma) return;

  const paramsParse = parseModuloIdParams(request.params);
  if (!paramsParse.success) {
    return responderErroValidacaoZod(reply, paramsParse, "http.plataforma.locatarios.modulos.params");
  }

  const deps = criarDepsAssinaturas();

  const assinaturaAtiva = await deps.assinaturasRepositorio.buscarAssinaturaAtivaPorLocatario(
    paramsParse.data.id,
  );

  if (!assinaturaAtiva.ok) {
    return sendHttpError(reply, assinaturaAtiva.error);
  }

  if (!assinaturaAtiva.value) {
    return sendHttpError(reply, {
      codigo: "ASSINATURA_NAO_ENCONTRADA",
      mensagem: "Locatário não possui assinatura ativa.",
      detalhes: {
        locatarioId: paramsParse.data.id,
        operacao: "http.plataforma.locatarios.modulos.desvincular.assinaturaAtiva",
      },
    });
  }

  const desvincular = createFnDesvincularModuloDaAssinatura(deps);

  const resultado = await desvincular({
    assinaturaId: assinaturaAtiva.value.assinaturaId,
    moduloId: paramsParse.data.moduloId,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}
