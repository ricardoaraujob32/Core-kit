// apps/api/src/modules/auditoria/auditarControllerPlataforma.ts

import type { FastifyRequest } from "fastify";
import { auditar } from "./auditoria.dispatcher";
import { criarContextoAuditoriaPlataforma } from "./auditoria.helpers";
import type { ContextoPlataformaAutorizado } from "../../http/autorizarPlataformaHttp";
import { createFnRegistrarEventoAuditoriaPlataforma, RegistrarEventoAuditoriaPlataformaInput } from "@core-kit/core";
import { clientePrisma } from "@core-kit/api/infra/prisma/client";
import { createAuditoriaPlataformaRepositorio } from "@core-kit/api/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma";

export type EventoAuditoriaPlataformaControllerInput = {
  evento: string;
  sucesso: boolean;
  entidadeNome?: string | null;
  entidadeTipo?: string | null;
  entidadeId?: string | null;
  erroCodigo?: string | null;
  erroMensagem?: string | null;
  locatarioAlvoId?: string | null;
  metadados?: Record<string, unknown>;
};

export async function auditarControllerPlataforma(
  request: FastifyRequest,
  plataforma: ContextoPlataformaAutorizado,
  evento: EventoAuditoriaPlataformaControllerInput,
): Promise<void> {
  const registrarEventoAuditoriaPlataforma =
    createFnRegistrarEventoAuditoriaPlataforma({
      auditoriaPlataformaRepositorio:
        createAuditoriaPlataformaRepositorio(clientePrisma),
    });

  const input: RegistrarEventoAuditoriaPlataformaInput = {
    superadminUsuarioId: plataforma.usuarioId,
    locatarioAlvoId: evento.locatarioAlvoId ?? null,
    evento: evento.evento,
    sucesso: evento.sucesso,
    erroCodigo: evento.erroCodigo ?? null,
    erroMensagem: evento.erroMensagem ?? null,
    entidadeNome: evento.entidadeNome ?? null,
    entidadeTipo: evento.entidadeTipo ?? null,
    entidadeId: evento.entidadeId ?? null,
    origem: "API",
    requisicaoId: request.id,
    enderecoIp: request.ip,
    agenteUsuario: request.headers["user-agent"] ?? null,
    agenteTipo: "USUARIO_PLATAFORMA",
    metadados: evento.metadados ?? {},
  };

  const resultado = await registrarEventoAuditoriaPlataforma(input);

  if (!resultado.ok) {
    console.error("[auditoria.plataforma.falha]", {
      evento: evento.evento,
      erro: resultado.error,
    });
  }
}