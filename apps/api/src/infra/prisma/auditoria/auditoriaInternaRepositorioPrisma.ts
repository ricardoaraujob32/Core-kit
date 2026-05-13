// apps/api/src/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma.ts

import type { AuditoriaId, AuditoriaPlataformaRepositorio, CategoriaAuditoria, ErroApp, EventoAuditoriaPlataforma, ListarAuditoriaPlataformaInput, 
  RegistrarEventoAuditoriaPlataformaInput, Result} from "@core-kit/core";
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

type AuditoriaPlataformaRow = {
  auditoria_id: string;
  usuario_id: string;
  locatario_alvo_id: string | null;
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

function resolverCategoriaSegura(evento: string): CategoriaAuditoria {
  try {
    return resolverEventoAuditoria(evento).categoria;
  } catch {
    return "OPERACAO";
  }
}

function metadadosComoRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function mapPlataforma(row: AuditoriaPlataformaRow): EventoAuditoriaPlataforma {
  return {
    auditoriaId: row.auditoria_id as AuditoriaId,
    usuarioId: row.usuario_id,
    superadminUsuarioId: row.usuario_id,
    locatarioAlvoId: row.locatario_alvo_id,
    evento: row.evento,
    categoria: resolverCategoriaSegura(row.evento),
    sucesso: row.sucesso,
    erroCodigo: row.erro_codigo,
    erroMensagem: row.erro_mensagem,    entidadeNome: row.entidade_nome,
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

function inputExigeUsuario(input: RegistrarEventoAuditoriaPlataformaInput): string {
  if (!input.superadminUsuarioId) {
    throw new Error(
      "O schema atual de auditoria exige usuario_id. Torne usuario_id nullable para auditar eventos anônimos ou falhas de login.",
    );
  }

  return input.superadminUsuarioId;
}

function toJsonInput(value: Record<string, unknown> | undefined): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonObject;
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
export function createAuditoriaPlataformaRepositorio(db: PrismaDb): AuditoriaPlataformaRepositorio {
  return {
    /**
     * Persiste um evento na auditoria interna.
     *
     * @param input Dados do evento.
     * @returns `Ok(eventoPersistido)` ou `Err(ErroApp)`.
     */
    async registrarEvento(input: RegistrarEventoAuditoriaPlataformaInput): Promise<Result<EventoAuditoriaPlataforma, ErroApp>> {
      try {
        const usuarioId = inputExigeUsuario(input);
        const row = await db.auditoria_plataforma.create({
          data: {
            usuario_id: usuarioId,
            locatario_alvo_id: input.locatarioAlvoId ?? null,
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
            usuario_id: true,
            locatario_alvo_id: true,
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

        return wrapOk(mapPlataforma(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria_plataforma",
          operacao: "auditoria.registrarEvento",
          detalhes: {
            locatarioId: input.locatarioAlvoId ?? null,
            usuarioId: input.superadminUsuarioId ?? null,
            evento: input.evento,
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
    async listarEventos(input: ListarAuditoriaPlataformaInput): Promise<Result<EventoAuditoriaPlataforma[], ErroApp>> {
      try {
        const resultados: EventoAuditoriaPlataforma[] = [];       
        const rows = await db.auditoria_plataforma.findMany({
          where: {
            ...(input.locatarioAlvoId
              ? { locatario_alvo_id: input.locatarioAlvoId }
              : {}),
            ...(input.usuarioId ? { usuario_id: input.usuarioId } : {}),
            ...(input.evento ? { evento: input.evento } : {}),
            ...(input.eventoPrefixo
              ? { evento: { startsWith: input.eventoPrefixo } }
              : {}),
            ...(input.sucesso !== undefined
              ? { sucesso: input.sucesso }
              : {}),
            ...(input.erroCodigo
              ? { erro_codigo: input.erroCodigo }
              : {}),
            ...(input.entidadeNome
              ? { entidade_nome: input.entidadeNome }
              : {}),
            ...(input.entidadeTipo
              ? { entidade_tipo: input.entidadeTipo }
              : {}),
            ...(input.entidadeId
              ? { entidade_id: input.entidadeId }
              : {}),
            ...(input.origem ? { origem: input.origem } : {}),
            ...(input.requisicaoId
              ? { requisicao_id: input.requisicaoId }
              : {}),
            ...(input.agenteTipo
              ? { agente_tipo: input.agenteTipo }
              : {}),
            ...(input.criadoDe || input.criadoAte
              ? {
                  criado_em: {
                    ...(input.criadoDe ? { gte: input.criadoDe } : {}),
                    ...(input.criadoAte ? { lte: input.criadoAte } : {}),
                  },
                }
              : {}),
          },
          orderBy: { criado_em: "desc" },
          ...(input.limite ? { take: input.limite } : { take: 100 }),
          select: {
            auditoria_id: true,
            usuario_id: true,
            locatario_alvo_id: true,
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

        resultados.push(...rows.map(mapPlataforma));
        resultados.sort(
          (a, b) => b.criadoEm.getTime() - a.criadoEm.getTime(),
        );

        return wrapOk(
          input.limite ? resultados.slice(0, input.limite) : resultados,
        );
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "auditoria",
          operacao: "auditoria.listarEventos",
          detalhes: {
            locatarioId: input.locatarioAlvoId,
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
