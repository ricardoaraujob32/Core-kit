// apps/api/src/modules/helpers.ts

import { ContextoExecucao, ModuloCodigo, Permissao } from "@core-kit/core";
import { FastifyReply, FastifyRequest } from "fastify";
import { autorizarHttp } from "../http/autorizarHttp";

/**
 * Obtém apenas o contexto autenticado/autorizado base.
 *
 * @param request Requisição atual.
 * @param reply Resposta atual.
 * @returns Contexto ou `null` quando erro já foi respondido.
 */
export async function obterCtxOuResponderErro(request: FastifyRequest, reply: FastifyReply): Promise<ContextoExecucao | null> {
  return autorizarHttp(request, reply);
}

/**
 * Obtém o contexto aplicando uma política declarativa completa.
 *
 * @param request Requisição atual.
 * @param reply Resposta atual.
 * @param politica Política de autorização.
 * @returns Contexto ou `null` quando erro já foi respondido.
 */
export async function obterCtxAutorizadoOuResponderErro(request: FastifyRequest, reply: FastifyReply,
  politica: {
    permissao?: Permissao;
    modulo?: ModuloCodigo;
    exigeSuperadmin?: boolean;
    locatarioIdAlvo?: string;
  },
): Promise<ContextoExecucao | null> {
  return autorizarHttp(request, reply, politica);
}
