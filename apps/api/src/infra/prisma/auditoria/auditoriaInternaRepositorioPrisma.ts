// apps/api/src/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma.ts

import type { AuditoriaId, AuditoriaInternaRepositorio, ErroApp, EventoAuditoriaInterna, ListarAuditoriaInternaInput, RegistrarEventoAuditoriaInternaInput, Result} from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

/**
 * Mapeia uma linha persistida para a entidade de domínio
 * `EventoAuditoriaInterna`.
 *
 * @param row Linha retornada pelo Prisma.
 * @returns Evento compatível com o Core.
 */
function mapEventoAuditoriaInterna(row: {
  auditoria_id: string;
  escopo: "PLATAFORMA" | "LOCATARIO";
  locatario_id: string | null;
  usuario_id: string | null;
  evento: string;
  categoria: "OPERACAO" | "SEGURANCA" | "ERRO" | "COMPLIANCE";
  sucesso: boolean;
  visibilidade: "INTERNA" | "CLIENTE" | "AMBOS";
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
}): EventoAuditoriaInterna {
  return {
    auditoriaId: row.auditoria_id as AuditoriaId,
    escopo: row.escopo,
    locatarioId: row.locatario_id,
    usuarioId: row.usuario_id,
    evento: row.evento,
    categoria: row.categoria,
    sucesso: row.sucesso,
    visibilidade: row.visibilidade,
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
 * Repositório Prisma da auditoria interna.
 *
 * Observação:
 * - esta trilha é a fonte canônica de auditoria do sistema;
 * - a auditoria ativa do locatário deve ser derivada dela.
 *
 * @param db Cliente Prisma raiz ou transacional.
 * @returns Implementação compatível com `AuditoriaInternaRepositorio`.
 */
export function createAuditoriaInternaRepositorio(db: PrismaDb): AuditoriaInternaRepositorio {
  return {
    /**
     * Persiste um evento na auditoria interna.
     *
     * @param input Dados do evento.
     * @returns `Ok(eventoPersistido)` ou `Err(ErroApp)`.
     */
    async registrarEvento(input: RegistrarEventoAuditoriaInternaInput): Promise<Result<EventoAuditoriaInterna, ErroApp>> {
      try {
        const row = await db.auditoria_interna.create({
          data: {
            escopo: input.escopo,
            locatario_id:
              input.escopo === "LOCATARIO" ? input.locatarioId ?? null : null,
            usuario_id: input.usuarioId ?? null,
            evento: input.evento,
            categoria: input.categoria,
            sucesso: input.sucesso,
            visibilidade: input.visibilidade ?? "INTERNA",
            erro_codigo: input.erroCodigo ?? null,
            erro_mensagem: input.erroMensagem ?? null,
            entidade_nome: input.entidadeNome ?? null,
            entidade_tipo: input.entidadeTipo ?? null,
            entidade_id: input.entidadeId ?? null,
            origem: input.origem ?? null,
            requisicao_id: input.requisicaoId ?? null,
            endereco_ip: input.enderecoIp ?? null,
            agente_usuario: input.agenteUsuario ?? null,
            agente_tipo: input.agenteTipo ?? null,
            metadados: input.metadados ?? {},
          },
          select: {
            auditoria_id: true,
            escopo: true,
            locatario_id: true,
            usuario_id: true,
            evento: true,
            categoria: true,
            sucesso: true,
            visibilidade: true,
            erro_codigo: true,
            erro_mensagem: true,
            entidade_nome: true,
            entidade_tipo: true,
            entidade_id: true,
            origem: true,
            requisicao_id: true,
            endereco_ip: true,
            agente_usuario: true,
            agente_tipo: true,
            metadados: true,
            criado_em: true,
          },
        });

        return wrapOk(mapEventoAuditoriaInterna(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria_interna",
          operacao: "auditoria_interna.registrarEvento",
          detalhes: {
            escopo: input.escopo,
            locatarioId: input.locatarioId ?? null,
            usuarioId: input.usuarioId ?? null,
            evento: input.evento,
            categoria: input.categoria,
            visibilidade: input.visibilidade ?? "INTERNA",
          },
        });
      }
    },

    /**
     * Lista eventos da auditoria interna com filtros avançados.
     *
     * @param input Filtros de consulta.
     * @returns `Ok(eventos)` ou `Err(ErroApp)`.
     */
    async listarEventos(
      input: ListarAuditoriaInternaInput,
    ): Promise<Result<EventoAuditoriaInterna[], ErroApp>> {
      try {
        const rows = await db.auditoria_interna.findMany({
          where: {
            ...(input.escopo ? { escopo: input.escopo } : {}),
            ...(input.locatarioId ? { locatario_id: input.locatarioId } : {}),
            ...(input.visibilidade ? { visibilidade: input.visibilidade } : {}),
            ...(input.evento ? { evento: input.evento } : {}),
            ...(input.eventoPrefixo
              ? { evento: { startsWith: input.eventoPrefixo } }
              : {}),
            ...(input.categoria ? { categoria: input.categoria } : {}),
            ...(input.sucesso !== undefined ? { sucesso: input.sucesso } : {}),
            ...(input.erroCodigo ? { erro_codigo: input.erroCodigo } : {}),
            ...(input.entidadeNome ? { entidade_nome: input.entidadeNome } : {}),
            ...(input.entidadeTipo ? { entidade_tipo: input.entidadeTipo } : {}),
            ...(input.entidadeId ? { entidade_id: input.entidadeId } : {}),
            ...(input.usuarioId ? { usuario_id: input.usuarioId } : {}),
            ...(input.origem ? { origem: input.origem } : {}),
            ...(input.requisicaoId
              ? { requisicao_id: input.requisicaoId }
              : {}),
            ...(input.agenteTipo ? { agente_tipo: input.agenteTipo } : {}),
            ...((input.criadoDe || input.criadoAte)
              ? {
                  criado_em: {
                    ...(input.criadoDe ? { gte: input.criadoDe } : {}),
                    ...(input.criadoAte ? { lte: input.criadoAte } : {}),
                  },
                }
              : {}),
            ...(input.textoLivre
              ? {
                  OR: [
                    { evento: { contains: input.textoLivre } },
                    { entidade_nome: { contains: input.textoLivre } },
                    { entidade_tipo: { contains: input.textoLivre } },
                    { entidade_id: { contains: input.textoLivre } },
                    { erro_codigo: { contains: input.textoLivre } },
                    { erro_mensagem: { contains: input.textoLivre } },
                    { origem: { contains: input.textoLivre } },
                    { requisicao_id: { contains: input.textoLivre } },
                    { agente_tipo: { contains: input.textoLivre } },
                  ],
                }
              : {}),
          },
          orderBy: {
            criado_em: "desc",
          },
          ...(input.cursor
            ? {
                cursor: {
                  auditoria_id: input.cursor,
                },
                skip: 1,
              }
            : {}),
          ...(input.limite ? { take: input.limite } : {}),
          select: {
            auditoria_id: true,
            escopo: true,
            locatario_id: true,
            usuario_id: true,
            evento: true,
            categoria: true,
            sucesso: true,
            visibilidade: true,
            erro_codigo: true,
            erro_mensagem: true,
            entidade_nome: true,
            entidade_tipo: true,
            entidade_id: true,
            origem: true,
            requisicao_id: true,
            endereco_ip: true,
            agente_usuario: true,
            agente_tipo: true,
            metadados: true,
            criado_em: true,
          },
        });

        return wrapOk(rows.map(mapEventoAuditoriaInterna));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria_interna",
          operacao: "auditoria_interna.listarEventos",
          detalhes: {
            escopo: input.escopo,
            locatarioId: input.locatarioId,
            visibilidade: input.visibilidade,
            evento: input.evento,
            eventoPrefixo: input.eventoPrefixo,
            categoria: input.categoria,
            sucesso: input.sucesso,
            erroCodigo: input.erroCodigo,
            entidadeNome: input.entidadeNome,
            entidadeTipo: input.entidadeTipo,
            entidadeId: input.entidadeId,
            usuarioId: input.usuarioId,
            origem: input.origem,
            requisicaoId: input.requisicaoId,
            agenteTipo: input.agenteTipo,
            criadoDe: input.criadoDe,
            criadoAte: input.criadoAte,
            textoLivre: input.textoLivre,
            cursor: input.cursor,
            limite: input.limite,
          },
        });
      }
    },
  };
}
