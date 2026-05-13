// apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts

import type { AuditoriaLocatarioRepositorio, AuditoriaId, ErroApp, EventoAuditoriaLocatario, ListarAuditoriaLocatarioInput, Result } from "@core-kit/core";
import { resolverEventoAuditoria, wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";
import { Prisma } from "@prisma/client";

type AuditoriaLocatarioRow = {
  auditoria_id: string;
  locatario_id: string;
  usuario_id: string;
  evento: string;
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
  metadados: unknown;
  criado_em: Date;
};

function resolverCategoriaSegura(evento: string) {
  try {
    return resolverEventoAuditoria(evento).categoria;
  } catch {
    return "OPERACAO" as const;
  }
}

function metadadosComoRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function mapRow(row: AuditoriaLocatarioRow): EventoAuditoriaLocatario {
  return {
    auditoriaId: row.auditoria_id,
    locatarioId: row.locatario_id,
    usuarioId: row.usuario_id,
    evento: row.evento,
    categoria: resolverCategoriaSegura(row.evento),
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
    metadados: metadadosComoRecord(row.metadados),
    criadoEm: row.criado_em,
  };
}

function toJsonInput(value: Record<string, unknown> | undefined) {
  return (value ?? {}) as Prisma.InputJsonObject;
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
export function createAuditoriaLocatarioRepositorio(db: PrismaDb): AuditoriaLocatarioRepositorio {
  return {
    async registrarEvento(input) {
      try {
        if (!input.usuarioId) {
          return mapearErroInfra(
            new Error("usuarioId é obrigatório para auditoria de locatário."),
            {
              entidade: "auditoria_locatario",
              operacao: "auditoria.locatario.registrarEvento",
              detalhes: {
                locatarioId: input.locatarioId,
                evento: input.evento,
                motivo: "usuario_id_obrigatorio_no_schema_atual",
              },
            },
          );
        }

        const row = await db.auditoria_locatario.create({
        data: {
          locatario_id: input.locatarioId,
          usuario_id: input.usuarioId,
          evento: input.evento,
          sucesso: input.sucesso,
          erro_codigo: input.erroCodigo ?? null,
          erro_mensagem: input.erroMensagem ?? null,
          entidade_nome: input.entidadeNome ?? null,
          entidade_tipo: input.entidadeTipo ?? null,
          entidade_id: input.entidadeId ?? null,
          origem: input.origem ?? "API",
          requisicao_id: input.requisicaoId ?? null,
          endereco_ip: input.enderecoIp ?? null,
          agente_usuario: input.agenteUsuario ?? null,
          agente_tipo: input.agenteTipo ?? null,
          metadados: toJsonInput(input.metadados),
        },
        select: {
          auditoria_id: true,
          locatario_id: true,
          usuario_id: true,
          evento: true,
          sucesso: true,
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

        return wrapOk(mapRow(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria_locatario",
          operacao: "auditoria.registrarEvento",
        });
      }
    },
    
    /**
     * Lista eventos visíveis ao locatário com filtros avançados.
     *
     * @param input Filtros de consulta.
     * @returns `Ok(eventos)` ou `Err(ErroApp)`.
     */
    async listarEventos(input: ListarAuditoriaLocatarioInput): Promise<Result<EventoAuditoriaLocatario[], ErroApp>> {
      try {
        const rows = await db.auditoria_locatario.findMany({
          where: {
            locatario_id: input.locatarioId,
            ...(input.usuarioId ? { usuario_id: input.usuarioId } : {}),
            ...(input.evento ? { evento: input.evento } : {}),
            ...(input.eventoPrefixo
              ? { evento: { startsWith: input.eventoPrefixo } }
              : {}),
            ...(input.sucesso !== undefined ? { sucesso: input.sucesso } : {}),
            ...(input.erroCodigo ? { erro_codigo: input.erroCodigo } : {}),
            ...(input.entidadeNome ? { entidade_nome: input.entidadeNome } : {}),
            ...(input.entidadeTipo ? { entidade_tipo: input.entidadeTipo } : {}),
            ...(input.entidadeId ? { entidade_id: input.entidadeId } : {}),
            ...(input.origem ? { origem: input.origem } : {}),
            ...(input.requisicaoId ? { requisicao_id: input.requisicaoId } : {}),
            ...(input.agenteTipo ? { agente_tipo: input.agenteTipo } : {}),
            ...(input.criadoDe || input.criadoAte
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
          orderBy: { criado_em: "desc" },
          ...(input.limite ? { take: input.limite } : { take: 100 }),
          select: {
            auditoria_id: true,
            locatario_id: true,
            usuario_id: true,
            evento: true,
            sucesso: true,
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

        return wrapOk(rows.map(mapRow));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria_locatario",
          operacao: "auditoria_locatario.listarEventos",
          detalhes: {
            locatarioId: input.locatarioId,
            evento: input.evento,
            eventoPrefixo: input.eventoPrefixo,
            sucesso: input.sucesso,
            entidadeTipo: input.entidadeTipo,
            entidadeId: input.entidadeId,
            usuarioId: input.usuarioId,
            criadoDe: input.criadoDe,
            criadoAte: input.criadoAte,
            textoLivre: input.textoLivre,
            limite: input.limite,
          },
        });
      }
    },
  };
}
