// apps/api/src/modules/auditoria/auditoriaPlataforma.controller.ts

// import type { FastifyReply, FastifyRequest } from "fastify";

// import { sendHttpError } from "../../http/serializarErroApp";
// import { clientePrisma } from "../../infra/prisma/client";
// import { auditar } from "./auditoria.dispatcher.instance";
// import type { ListarAuditoriaPlataformaQuery } from "./auditoria.dto";
// import { criarContextoAuditoria } from "./auditoria.helpers";

/**
 * Controller HTTP para listagem da auditoria da plataforma.
 *
 * Regras:
 * - acesso exclusivo de superadmin;
 * - lê apenas `auditoria_plataforma`;
 * - suporta filtros avançados.
 */
// export async function listarAuditoriaPlataformaController(request: FastifyRequest<{ Querystring: ListarAuditoriaPlataformaQuery }>, reply: FastifyReply) {
  // const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
  //   exigeSuperadmin: true,
  // });
  // if (!ctx) return;

  // const listarAuditoriaPlataforma = createFnListarAuditoriaPlataforma({
  //   auditoriaPlataformaRepositorio:
  //     createAuditoriaPlataformaRepositorio(clientePrisma),
  // });

  // const resultado = await listarAuditoriaPlataforma({
  //   evento: request.query.evento,
  //   eventoPrefixo: request.query.eventoPrefixo,
  //   categoria: request.query.categoria,
  //   sucesso:
  //     request.query.sucesso === undefined
  //       ? undefined
  //       : request.query.sucesso === "true",
  //   erroCodigo: request.query.erroCodigo,
  //   entidadeNome: request.query.entidadeNome,
  //   entidadeTipo: request.query.entidadeTipo,
  //   entidadeId: request.query.entidadeId,
  //   usuarioId: request.query.usuarioId,
  //   origem: request.query.origem,
  //   requisicaoId: request.query.requisicaoId,
  //   agenteTipo: request.query.agenteTipo,
  //   textoLivre: request.query.textoLivre,
  //   cursor: request.query.cursor,
  //   limite: request.query.limite ? Number(request.query.limite) : undefined,
  //   criadoDe: request.query.criadoDe ? new Date(request.query.criadoDe) : undefined,
  //   criadoAte: request.query.criadoAte ? new Date(request.query.criadoAte) : undefined,
  //   locatarioAlvoId: request.query.locatarioAlvoId,
  // });

  // await auditar(criarContextoAuditoria(request, ctx, { isSuperadmin: true }),
  //   {
  //     evento: "auditoria.plataforma.listada",
  //     sucesso: resultado.ok,
  //     entidadeTipo: "auditoria",
  //     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
  //     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
  //     metadados: {
  //       contexto: {
  //         filtrosAplicados: request.query,
  //         quantidadeResultados: resultado.ok ? resultado.value.lista.length : 0,
  //       },
  //     },
  //   },
  // );

  // if (!resultado.ok) {
  //   return sendHttpError(reply, resultado.error);
  // }

  // return reply.status(200).send({
  //   lista: resultado.value.lista,
  // });
// }
