// // apps/api/src/modules/auditoria/auditoria.controller.ts

import { sendHttpError } from "@core-kit/api/http/serializarErroApp";
import { toListarAuditoriaResponseDto } from "./auditoria.presenter.js";
import { createFnListarAuditoriaLocatario, createFnListarAuditoriaPlataforma, Permissoes } from "@core-kit/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { createAuditoriaLocatarioRepositorio } from "@core-kit/api/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma";
import { clientePrisma } from "@core-kit/api/infra/prisma/client";
import { ListarAuditoriaQueryDto, parseListarAuditoriaQuery } from "./auditoria.dto.js";
import { autorizarHttp } from "@core-kit/api/http/autorizarHttp";
import { createAuditoriaPlataformaRepositorio } from "@core-kit/api/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma";

function responderErroValidacao(reply: FastifyReply, parseResult: {
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
      operacao: "http.auditoria.validacao",
      campos: fieldErrors,
      formulario: formErrors,
    },
  });
}

function criarDepsAuditoriaLocatario() {
  return {
    auditoriaLocatarioRepositorio: createAuditoriaLocatarioRepositorio(clientePrisma),
  };
}

function criarDepsAuditoriaPlataforma() {
  return {
    auditoriaPlataformaRepositorio: createAuditoriaPlataformaRepositorio(clientePrisma),
  };
}

export async function listarMinhaAuditoriaController(request: FastifyRequest<{ Querystring: ListarAuditoriaQueryDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    // permissao: Permissoes.TENANT_AUDITORIA_LISTAR,
    // modulo: "AUDITORIA",
  });
  if (!ctx) return;

  const queryParse = parseListarAuditoriaQuery(request.query ?? {});
  if (!queryParse.success) {
    return responderErroValidacao(reply, queryParse);
  }

  const listarAuditoria = createFnListarAuditoriaLocatario(
    criarDepsAuditoriaLocatario(),
  );

  const resultado = await listarAuditoria({
    locatarioId: ctx.locatarioId,
    ...queryParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarAuditoriaResponseDto(resultado.value.itens),
  });
}

export async function listarAuditoriaPlataformaController(request: FastifyRequest<{ Querystring: ListarAuditoriaQueryDto }>, reply: FastifyReply) {
  const ctx = await autorizarHttp(request, reply, {
    exigeSuperadmin: true,
  });
  if (!ctx) return;

  const queryParse = parseListarAuditoriaQuery(request.query ?? {});
  if (!queryParse.success) {
    return responderErroValidacao(reply, queryParse);
  }

  const listarAuditoria = createFnListarAuditoriaPlataforma(
    criarDepsAuditoriaPlataforma(),
  );

  const resultado = await listarAuditoria({
    ...queryParse.data,
  });

  if (!resultado.ok) {
    return sendHttpError(reply, resultado.error);
  }

  return reply.status(200).send({
    itens: toListarAuditoriaResponseDto(resultado.value.itens),
  });
}
