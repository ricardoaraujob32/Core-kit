// apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts

import type { AuditoriaAtivaLocatarioRepositorio, AuditoriaId, ErroApp, EventoAuditoriaAtivaLocatario, ListarAuditoriaAtivaLocatarioInput, Result } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

/**
 * Mapeia uma linha persistida para a projeção de domínio
 * `EventoAuditoriaAtivaLocatario`.
 *
 * @param row Linha retornada pelo Prisma.
 * @returns Evento compatível com o Core.
 */
function mapEventoAuditoriaAtivaLocatario(row: {
  auditoria_id: string;
  locatario_id: string;
  usuario_id: string | null;
  evento: string;
  categoria: "OPERACAO" | "SEGURANCA" | "ERRO" | "COMPLIANCE";
  sucesso: boolean;
  erro_codigo: string | null;
  erro_mensagem: string | null;
  entidade_nome: string | null;
  entidade_tipo: string | null;
  entidade_id: string | null;
  origem: string | null;
  requisicao_id: string | null;
  endereco_ip: string | null;
  agente_usuario: string | null;
  agente_tipo: string | null;
  metadados: Record<string, unknown> | null;
  criado_em: Date;
}): EventoAuditoriaAtivaLocatario {
  return {
    auditoriaId: row.auditoria_id as AuditoriaId,
    locatarioId: row.locatario_id,
    usuarioId: row.usuario_id,
    evento: row.evento,
    categoria: row.categoria,
    sucesso: row.sucesso,
    erroCodigo: row.erro_codigo,
    erroMensagem: row.erro_mensagem,
    entidadeNome: row.entidade_nome,
    entidadeTipo: row.entidade_tipo,
    entidadeId: row.entidade_id,
    origem: row.origem,
    requisicaoId: row.requisicao_id,
    enderecoIp: row.endereco_ip,
    agenteUsuario: row.agente_usuario,
    agenteTipo: row.agente_tipo,
    metadados: row.metadados ?? {},
    criadoEm: row.criado_em,
  };
}

/**
 * Repositório Prisma da auditoria ativa do locatário.
 *
 * Observação:
 * - esta visão deve retornar apenas eventos publicáveis ao cliente;
 * - a recomendação é apontar este adapter para uma view/materialização
 *   derivada da auditoria interna.
 *
 * @param db Cliente Prisma raiz ou transacional.
 * @returns Implementação compatível com `AuditoriaAtivaLocatarioRepositorio`.
 */
// export function createAuditoriaAtivaLocatarioRepositorio(db: PrismaDb): AuditoriaAtivaLocatarioRepositorio {
//   return {
    /**
     * Lista eventos visíveis ao locatário com filtros avançados.
     *
     * @param input Filtros de consulta.
     * @returns `Ok(eventos)` ou `Err(ErroApp)`.
     */
    // async listarEventos(input: ListarAuditoriaAtivaLocatarioInput): Promise<Result<EventoAuditoriaAtivaLocatario[], ErroApp>> {
    //   try {
    //     const rows = await db.auditoria_ativa_locatario.findMany({
    //       where: {
    //         locatario_id: input.locatarioId,
    //         ...(input.evento ? { evento: input.evento } : {}),
    //         ...(input.eventoPrefixo
    //           ? { evento: { startsWith: input.eventoPrefixo } }
    //           : {}),
    //         ...(input.categoria ? { categoria: input.categoria } : {}),
    //         ...(input.sucesso !== undefined ? { sucesso: input.sucesso } : {}),
    //         ...(input.erroCodigo ? { erro_codigo: input.erroCodigo } : {}),
    //         ...(input.entidadeNome ? { entidade_nome: input.entidadeNome } : {}),
    //         ...(input.entidadeTipo ? { entidade_tipo: input.entidadeTipo } : {}),
    //         ...(input.entidadeId ? { entidade_id: input.entidadeId } : {}),
    //         ...(input.usuarioId ? { usuario_id: input.usuarioId } : {}),
    //         ...(input.origem ? { origem: input.origem } : {}),
    //         ...(input.requisicaoId
    //           ? { requisicao_id: input.requisicaoId }
    //           : {}),
    //         ...(input.agenteTipo ? { agente_tipo: input.agenteTipo } : {}),
    //         ...((input.criadoDe || input.criadoAte)
    //           ? {
    //               criado_em: {
    //                 ...(input.criadoDe ? { gte: input.criadoDe } : {}),
    //                 ...(input.criadoAte ? { lte: input.criadoAte } : {}),
    //               },
    //             }
    //           : {}),
    //         ...(input.textoLivre
    //           ? {
    //               OR: [
    //                 { evento: { contains: input.textoLivre } },
    //                 { entidade_nome: { contains: input.textoLivre } },
    //                 { entidade_tipo: { contains: input.textoLivre } },
    //                 { entidade_id: { contains: input.textoLivre } },
    //                 { erro_codigo: { contains: input.textoLivre } },
    //                 { erro_mensagem: { contains: input.textoLivre } },
    //                 { origem: { contains: input.textoLivre } },
    //                 { requisicao_id: { contains: input.textoLivre } },
    //                 { agente_tipo: { contains: input.textoLivre } },
    //               ],
    //             }
    //           : {}),
    //       },
    //       orderBy: {
    //         criado_em: "desc",
    //       },
    //       ...(input.cursor
    //         ? {
    //             cursor: {
    //               auditoria_id: input.cursor,
    //             },
    //             skip: 1,
    //           }
    //         : {}),
    //       ...(input.limite ? { take: input.limite } : {}),
    //       select: {
    //         auditoria_id: true,
    //         locatario_id: true,
    //         usuario_id: true,
    //         evento: true,
    //         categoria: true,
    //         sucesso: true,
    //         erro_codigo: true,
    //         erro_mensagem: true,
    //         entidade_nome: true,
    //         entidade_tipo: true,
    //         entidade_id: true,
    //         origem: true,
    //         requisicao_id: true,
    //         endereco_ip: true,
    //         agente_usuario: true,
    //         agente_tipo: true,
    //         metadados: true,
    //         criado_em: true,
    //       },
    //     });

    //     return wrapOk(rows.map(mapEventoAuditoriaAtivaLocatario));
    //   } catch (causa) {
    //     return mapearErroInfra(causa, {
    //       entidade: "auditoria_ativa_locatario",
    //       operacao: "auditoria_ativa_locatario.listarEventos",
    //       detalhes: {
    //         locatarioId: input.locatarioId,
    //         evento: input.evento,
    //         eventoPrefixo: input.eventoPrefixo,
    //         categoria: input.categoria,
    //         sucesso: input.sucesso,
    //         erroCodigo: input.erroCodigo,
    //         entidadeNome: input.entidadeNome,
    //         entidadeTipo: input.entidadeTipo,
    //         entidadeId: input.entidadeId,
    //         usuarioId: input.usuarioId,
    //         origem: input.origem,
    //         requisicaoId: input.requisicaoId,
    //         agenteTipo: input.agenteTipo,
    //         criadoDe: input.criadoDe,
    //         criadoAte: input.criadoAte,
    //         textoLivre: input.textoLivre,
    //         cursor: input.cursor,
    //         limite: input.limite,
    //       },
    //     });
    //   }
//     },
//   };
// }
