// apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts

import type { Cliente, ClienteId, ClientesRepositorio, ErroApp, LocatarioId, Result, UsuarioId } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

type ClienteRow = {
  cliente_id: string;
  locatario_id: string;
  nome: string;
  documento: string | null;
  email: string | null;
  telefone: string | null;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
  excluido_por: string | null;
  excluido_motivo: string | null;
};

const clienteSelect = {
  cliente_id: true,
  locatario_id: true,
  nome: true,
  documento: true,
  email: true,
  telefone: true,
  criado_em: true,
  atualizado_em: true,
  excluido_em: true,
  excluido_por: true,
  excluido_motivo: true,
} as const;

function normalizarEmail(email: string | null): string | null {
  const value = email?.trim().toLowerCase();
  return value ? value : null;
}

function normalizarTextoOpcional(value: string | null): string | null {
  const normalizado = value?.trim();
  return normalizado ? normalizado : null;
}

function mapCliente(row: ClienteRow): Cliente {
  return {
    clienteId: row.cliente_id as ClienteId,
    locatarioId: row.locatario_id as LocatarioId,
    nome: row.nome,
    documento: row.documento,
    email: row.email,
    telefone: row.telefone,
    // O schema atual não possui coluna `status`; o estado é derivado do soft delete.
    status: row.excluido_em ? "EXCLUIDO" : "ATIVO",
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    excluidoEm: row.excluido_em,
    excluidoPor: row.excluido_por as UsuarioId | null,
    excluidoMotivo: row.excluido_motivo,
  };
}

/**
 * Repositório Prisma do módulo de clientes.
 *
 * Observação:
 * - o banco atual não possui coluna `status` em `clientes`;
 * - por isso, `status` é derivado de `excluido_em` até o schema evoluir.
 */
export function createClientesRepositorio(db: PrismaDb): ClientesRepositorio {
  return {
    async criar(cliente): Promise<Result<{ clienteId: ClienteId }, ErroApp>> {
      try {
        await db.clientes.create({
          data: {
            cliente_id: cliente.clienteId,
            locatario_id: cliente.locatarioId,
            nome: cliente.nome,
            documento: normalizarTextoOpcional(cliente.documento),
            email: normalizarEmail(cliente.email),
            telefone: normalizarTextoOpcional(cliente.telefone),
            criado_em: cliente.criadoEm,
            atualizado_em: cliente.atualizadoEm,
            excluido_em: cliente.excluidoEm,
            excluido_por: cliente.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(cliente.excluidoMotivo),
          },
        });

        return wrapOk({ clienteId: cliente.clienteId });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "clientes",
          operacao: "infra.clientes.criar",
          detalhes: {
            clienteId: cliente.clienteId,
            locatarioId: cliente.locatarioId,
            email: normalizarEmail(cliente.email),
          },
        });
      }
    },

    async buscarPorId(params): Promise<Result<Cliente | null, ErroApp>> {
      try {
        const row = await db.clientes.findFirst({
          where: {
            cliente_id: params.clienteId,
            locatario_id: params.locatarioId,
          },
          select: clienteSelect,
        });

        return wrapOk(row ? mapCliente(row) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "clientes",
          operacao: "infra.clientes.buscarPorId",
          detalhes: params,
        });
      }
    },

    async listarPorLocatario(params): Promise<Result<Cliente[], ErroApp>> {
      try {
        const rows = await db.clientes.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
          },
          orderBy: { cliente_id: "asc" },
          ...(params.cursor
            ? {
                cursor: {
                  locatario_id_cliente_id: {
                    cliente_id: params.cursor,
                    locatario_id: params.locatarioId,
                  },
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: clienteSelect,
        });

        return wrapOk(rows.map(mapCliente));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "clientes",
          operacao: "infra.clientes.listarPorLocatario",
          detalhes: params,
        });
      }
    },

    async atualizar(cliente): Promise<Result<Cliente, ErroApp>> {
      try {
        await db.clientes.update({
          where: {
            locatario_id_cliente_id: {
              cliente_id: cliente.clienteId,
              locatario_id: cliente.locatarioId,
            },
          },
          data: {
            nome: cliente.nome,
            documento: normalizarTextoOpcional(cliente.documento),
            email: normalizarEmail(cliente.email),
            telefone: normalizarTextoOpcional(cliente.telefone),
            atualizado_em: cliente.atualizadoEm,
            excluido_em: cliente.excluidoEm,
            excluido_por: cliente.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(cliente.excluidoMotivo),
          },
        });

        return wrapOk({
          ...cliente,
          documento: normalizarTextoOpcional(cliente.documento),
          email: normalizarEmail(cliente.email),
          telefone: normalizarTextoOpcional(cliente.telefone),
          excluidoMotivo: normalizarTextoOpcional(cliente.excluidoMotivo),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "clientes",
          operacao: "infra.clientes.atualizar",
          detalhes: {
            clienteId: cliente.clienteId,
            locatarioId: cliente.locatarioId,
          },
        });
      }
    },
  };
}
