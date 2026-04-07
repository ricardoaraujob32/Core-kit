// // apps/api/src/modules/auditoria/auditoria.controller.ts

// import type { FastifyReply, FastifyRequest } from "fastify";
// import { createFnListarAuditoriaAtivaLocatario, Permissoes } from "@core-kit/core";
// import { sendHttpError } from "../../http/serializarErroApp";
// import { clientePrisma } from "../../infra/prisma/client";
// import { createAuditoriaAtivaLocatarioRepositorio } from "../../infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma";
// import { auditar } from "./auditoria.dispatcher.instance";
// import { criarContextoAuditoria } from "./auditoria.helpers";
// import { obterCtxAutorizadoOuResponderErro } from "../helpers";

// /**
//  * Querystring aceita para listagem da auditoria ativa do locatário.
//  */
// type ListarAuditoriaAtivaLocatarioQuery = {
//   evento?: string;
//   eventoPrefixo?: string;
//   categoria?: "OPERACAO" | "SEGURANCA" | "ERRO" | "COMPLIANCE";
//   sucesso?: "true" | "false";
//   erroCodigo?: string;
//   entidadeNome?: string;
//   entidadeTipo?: string;
//   entidadeId?: string;
//   usuarioId?: string;
//   origem?: string;
//   requisicaoId?: string;
//   agenteTipo?: string;
//   textoLivre?: string;
//   cursor?: string;
//   limite?: string;
//   criadoDe?: string;
//   criadoAte?: string;
// };

// /**
//  * Lista a auditoria ativa visível ao admin do locatário autenticado.
//  *
//  * Permissão sugerida:
//  * - `tenant.auditoria.ler`
//  *
//  * @param request Requisição com querystring de filtros.
//  * @param reply Resposta Fastify.
//  * @returns Lista de eventos visíveis ao locatário.
//  */
// export async function listarAuditoriaAtivaLocatarioController(request: FastifyRequest<{ Querystring: ListarAuditoriaAtivaLocatarioQuery }>, reply: FastifyReply) {
//   const ctx = await obterCtxAutorizadoOuResponderErro(request, reply, {
//     permissao: Permissoes.TENANT_AUDITORIA_LER,
//   });
//   if (!ctx) return;

//   const listarAuditoriaAtivaLocatario = createFnListarAuditoriaAtivaLocatario({
//     auditoriaAtivaLocatarioRepositorio:
//       createAuditoriaAtivaLocatarioRepositorio(clientePrisma),
//   });

//   const resultado = await listarAuditoriaAtivaLocatario({
//     locatarioId: ctx.locatarioId,
//     evento: request.query.evento,
//     eventoPrefixo: request.query.eventoPrefixo,
//     categoria: request.query.categoria,
//     sucesso:
//       request.query.sucesso === undefined
//         ? undefined
//         : request.query.sucesso === "true",
//     erroCodigo: request.query.erroCodigo,
//     entidadeNome: request.query.entidadeNome,
//     entidadeTipo: request.query.entidadeTipo,
//     entidadeId: request.query.entidadeId,
//     usuarioId: request.query.usuarioId,
//     origem: request.query.origem,
//     requisicaoId: request.query.requisicaoId,
//     agenteTipo: request.query.agenteTipo,
//     textoLivre: request.query.textoLivre,
//     cursor: request.query.cursor,
//     limite: request.query.limite ? Number(request.query.limite) : undefined,
//     criadoDe: request.query.criadoDe ? new Date(request.query.criadoDe) : undefined,
//     criadoAte: request.query.criadoAte ? new Date(request.query.criadoAte) : undefined,
//   });

//   await auditar(criarContextoAuditoria(request, ctx), {
//     evento: "auditoria.locatario.listada",
//     sucesso: resultado.ok,
//     entidadeTipo: "auditoria",
//     erroCodigo: !resultado.ok ? resultado.error.codigo : null,
//     erroMensagem: !resultado.ok ? resultado.error.mensagem : null,
//     metadados: {
//       contexto: {
//         filtrosAplicados: request.query,
//         quantidadeResultados: resultado.ok
//           ? (resultado.value as any).lista?.length ?? (resultado.value as any).itens?.length ?? 0
//           : 0,
//       },
//     },
//   });

//   if (!resultado.ok) {
//     return sendHttpError(reply, resultado.error);
//   }

//   return reply.status(200).send({
//     lista: (resultado.value as any).lista ?? (resultado.value as any).itens,
//   });
// }
