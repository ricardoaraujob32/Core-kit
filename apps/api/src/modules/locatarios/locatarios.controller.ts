// apps/api/src/modules/locatarios/locatarios.controller.ts

import { FastifyReply, FastifyRequest } from "fastify";
import { sendHttpError } from "../../http/serializarErroApp";
import { clientePrisma } from "../../infra/prisma/client";
import { createFnListarLocatarios, createFnObterLocatario, metaAcao } from "@core-kit/core";
import { exigirMesmoLocatarioHttp } from "../../http/routeGuards";
import { createLocatariosRepositorio } from "../../infra/prisma/locatarios/locatariosRepositorioPrisma";
import { criarContextoAuditoria, exigirSuperAdminOuResponderErro, obterCtxAutorizadoOuResponderErro, obterCtxOuResponderErro } from "../helpers";
import { auditar } from "../auditoria/auditoria.dispatcher.instance";

/**
 * Builder oficial de contexto HTTP para este módulo.
 *
 * Observação:
 * - permanece explícito no controller para manter consistência com a borda atual;
 * - usa a factory oficial já alinhada ao runtime.
 */

/**
 * Controller do tenant admin:
 * só permite consultar o próprio locatário.
 *
 * @param request Requisição Fastify com `id` do locatário.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function obterMeuLocatarioController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
    locatarioIdAlvo: request.params.id,
  });
  if (!ctx) return;

  const erroMesmoLocatario = exigirMesmoLocatarioHttp(
    ctx,
    request.params.id,
  );

  if (erroMesmoLocatario) {
    return sendHttpError(reply, erroMesmoLocatario);
  }

  const repositorio = createLocatariosRepositorio(clientePrisma);
  const obterLocatario = createFnObterLocatario({
    locatarioRepositorio: repositorio,
  });

  const resultado = await obterLocatario({
    locatarioId: request.params.id,
  });

  await auditar(criarContextoAuditoria(request, { usuarioId: ctx.usuarioId, locatarioId: ctx.locatarioId, }),
    {
      evento: "locatario.obtido",
      sucesso: resultado.ok,
      entidadeTipo: "locatario",
      entidadeId: request.params.id,
      entidadeNome: resultado.ok ? resultado.value.locatario : null,
      erroCodigo: !resultado.ok ? resultado.error.codigo : null,
      erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
      metadados: metaAcao(),
    },
  );

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}

/**
 * Controller de listagem global de locatários.
 *
 * Uso restrito ao fluxo superadmin da borda HTTP.
 *
 * @param request Requisição Fastify autenticada.
 * @param reply Resposta Fastify.
 * @returns Resposta HTTP padronizada.
 */
export async function listarLocatariosSuperAdminController(request: FastifyRequest, reply: FastifyReply) {
  const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
    exigeSuperadmin: true,
  });
  if (!ctx) return;

  if (!exigirSuperAdminOuResponderErro(ctx, reply)) {
    return;
  }

  const repositorio = createLocatariosRepositorio(clientePrisma);
  const listarLocatarios = createFnListarLocatarios({
    locatarioRepositorio: repositorio,
  });

  const resultado = await listarLocatarios({});

  await auditar(criarContextoAuditoria(request, { usuarioId: ctx.usuarioId, isSuperadmin: true, }),
  {
    evento: "plataforma.locatario.listado",
    sucesso: resultado.ok,
    entidadeTipo: "locatario",
    erroCodigo: !resultado.ok ? resultado.error.codigo : null,
    erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
    metadados: metaAcao({
      quantidadeResultados: resultado.ok
        ? (Array.isArray(resultado.value)
            ? resultado.value.length
            : resultado.value.itens?.length ?? 0)
        : 0,
    }),
  },
);

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: resultado.value.itens ?? resultado.value,
  });
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
export async function obterLocatarioSuperAdminController(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
    exigeSuperadmin: true,
  });
  if (!ctx) return;

  if (!exigirSuperAdminOuResponderErro(ctx, reply)) {
    return;
  }

  const repositorio = createLocatariosRepositorio(clientePrisma);
  const obterLocatario = createFnObterLocatario({
    locatarioRepositorio: repositorio,
  });

  const resultado = await obterLocatario({
    locatarioId: request.params.id,
  });

  await auditar(criarContextoAuditoria(request, { usuarioId: ctx.usuarioId, isSuperadmin: true, locatarioAlvoId: request.params.id, }),
    {
      evento: "plataforma.locatario.obtido",
      sucesso: resultado.ok,
      entidadeTipo: "locatario",
      entidadeId: request.params.id,
      entidadeNome: resultado.ok ? resultado.value.nome : null,
      erroCodigo: !resultado.ok ? resultado.error.codigo : null,
      erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
      metadados: metaAcao(),
    },
  );

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    item: resultado.value,
  });
}
