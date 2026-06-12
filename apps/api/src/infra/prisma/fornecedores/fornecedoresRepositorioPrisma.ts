// apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts

import type { ErroApp, Fornecedor, FornecedorId, FornecedoresRepositorio, LocatarioId, Result, UsuarioId } from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

type FornecedorRow = {
  fornecedor_id: string;
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

const fornecedorSelect = {
  fornecedor_id: true,
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

function mapFornecedor(row: FornecedorRow): Fornecedor {
  return {
    fornecedorId: row.fornecedor_id as FornecedorId,
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
 * Repositório Prisma do módulo de fornecedores.
 *
 * Observação:
 * - o banco atual não possui coluna `status` em `fornecedores`;
 * - por isso, `status` é derivado de `excluido_em` até o schema evoluir.
 */
export function createFornecedoresRepositorio(db: PrismaDb): FornecedoresRepositorio {
  return {
    async criar(fornecedor): Promise<Result<{ fornecedorId: FornecedorId }, ErroApp>> {
      try {
        await db.fornecedores.create({
          data: {
            fornecedor_id: fornecedor.fornecedorId,
            locatario_id: fornecedor.locatarioId,
            nome: fornecedor.nome,
            documento: normalizarTextoOpcional(fornecedor.documento),
            email: normalizarEmail(fornecedor.email),
            telefone: normalizarTextoOpcional(fornecedor.telefone),
            criado_em: fornecedor.criadoEm,
            atualizado_em: fornecedor.atualizadoEm,
            excluido_em: fornecedor.excluidoEm,
            excluido_por: fornecedor.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(fornecedor.excluidoMotivo),
          },
        });

        return wrapOk({ fornecedorId: fornecedor.fornecedorId });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "fornecedores",
          operacao: "infra.fornecedores.criar",
          detalhes: {
            fornecedorId: fornecedor.fornecedorId,
            locatarioId: fornecedor.locatarioId,
            email: normalizarEmail(fornecedor.email),
          },
        });
      }
    },

    async buscarPorId(params): Promise<Result<Fornecedor | null, ErroApp>> {
      try {
        const row = await db.fornecedores.findFirst({
          where: {
            fornecedor_id: params.fornecedorId,
            locatario_id: params.locatarioId,
          },
          select: fornecedorSelect,
        });

        return wrapOk(row ? mapFornecedor(row) : null);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "fornecedores",
          operacao: "infra.fornecedores.buscarPorId",
          detalhes: params,
        });
      }
    },

    async listarPorLocatario(params): Promise<Result<Fornecedor[], ErroApp>> {
      try {
        const rows = await db.fornecedores.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
          },
          orderBy: { fornecedor_id: "asc" },
          ...(params.cursor
            ? {
                cursor: {
                  locatario_id_fornecedor_id: {
                    fornecedor_id: params.cursor,
                    locatario_id: params.locatarioId,
                  },
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: fornecedorSelect,
        });

        return wrapOk(rows.map(mapFornecedor));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "fornecedores",
          operacao: "infra.fornecedores.listarPorLocatario",
          detalhes: params,
        });
      }
    },

    async atualizar(fornecedor): Promise<Result<Fornecedor, ErroApp>> {
      try {
        await db.fornecedores.update({
          where: {
            locatario_id_fornecedor_id: {
              fornecedor_id: fornecedor.fornecedorId,
              locatario_id: fornecedor.locatarioId,
            },
          },
          data: {
            nome: fornecedor.nome,
            documento: normalizarTextoOpcional(fornecedor.documento),
            email: normalizarEmail(fornecedor.email),
            telefone: normalizarTextoOpcional(fornecedor.telefone),
            atualizado_em: fornecedor.atualizadoEm,
            excluido_em: fornecedor.excluidoEm,
            excluido_por: fornecedor.excluidoPor,
            excluido_motivo: normalizarTextoOpcional(fornecedor.excluidoMotivo),
          },
        });

        return wrapOk({
          ...fornecedor,
          documento: normalizarTextoOpcional(fornecedor.documento),
          email: normalizarEmail(fornecedor.email),
          telefone: normalizarTextoOpcional(fornecedor.telefone),
          excluidoMotivo: normalizarTextoOpcional(fornecedor.excluidoMotivo),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "fornecedores",
          operacao: "infra.fornecedores.atualizar",
          detalhes: {
            fornecedorId: fornecedor.fornecedorId,
            locatarioId: fornecedor.locatarioId,
          },
        });
      }
    },
  };
}
