// apps/api/src/infra/locatarios/locatariosRepositorioPrisma.ts

import { createErroApp, fromThrowableAsync, Locatario, LocatarioId, LocatariosRepositorio, wrapOk } from "@core-kit/core";
import { Prisma, PrismaClient } from "@prisma/client";

/**
 * 
 * @param row 
 * @returns 
 */
function mapPrismaLocatarioParaDominio(
  row: {
    locatario_id: LocatarioId;
    nome: string;
    slug: string;
    ativo: boolean;
    criado_em: Date;
    atualizado_em: Date;
  }
): Locatario {
  return {
    id: row.locatario_id,
    nome: row.nome,
    slug: row.slug,
    ativo: row.ativo,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

/**
 * 
 * @param prisma 
 * @returns 
 */
export function criarLocatariosRepositorioPrisma(prisma: PrismaClient | Prisma.TransactionClient): LocatariosRepositorio {
  return {
    async inserir(dados: CriarLocatarioEntrada & { id: LocatarioId }) {
      return fromThrowableAsync(
        async () => {
          const criado = await prisma.locatarios.create({
            data: {
              locatario_id: dados.id,
              nome: dados.nome,
              slug: dados.slug,
              ativo: dados.ativo ?? true,
            },
          });

          return wrapOk(mapPrismaLocatarioParaDominio(criado));
        },
        (causa) =>
          createErroApp({
            codigo: "ERRO_INTERNO",
            mensagem: "Falha ao inserir locatário.",
            detalhes: { operacao: "locatarios.inserir" },
            causa,
          })
      )();
    },

    async buscarPorId(id: LocatarioId) {
      return fromThrowableAsync(
        async () => {
          const row = await prisma.locatarios.findUnique({
            where: { locatario_id: id },
          });

          return wrapOk(row ? mapPrismaLocatarioParaDominio(row) : null);
        },
        (causa) =>
          createErroApp({
            codigo: "ERRO_INTERNO",
            mensagem: "Falha ao buscar locatário por id.",
            detalhes: { operacao: "locatarios.buscarPorId", id },
            causa,
          })
      )();
    },

    async buscarPorSlug(slug: string) {
      return fromThrowableAsync(
        async () => {
          const row = await prisma.locatarios.findUnique({
            where: { slug },
          });

          return wrapOk(row ? mapPrismaLocatarioParaDominio(row) : null);
        },
        (causa) =>
          createErroApp({
            codigo: "ERRO_INTERNO",
            mensagem: "Falha ao buscar locatário por slug.",
            detalhes: { operacao: "locatarios.buscarPorSlug", slug },
            causa,
          })
      )();
    },

    async listar() {
      return fromThrowableAsync(
        async () => {
          const rows = await prisma.locatarios.findMany({
            orderBy: { criado_em: "asc" },
          });

          return wrapOk(rows.map(mapPrismaLocatarioParaDominio));
        },
        (causa) =>
          createErroApp({
            codigo: "ERRO_INTERNO",
            mensagem: "Falha ao listar locatários.",
            detalhes: { operacao: "locatarios.listar" },
            causa,
          })
      )();
    },
  };
}

/**
 * 
 * @param causa 
 * @param contexto 
 * @returns 
 */
function mapearErroPrismaLocatarios(causa: unknown, contexto: Record<string, unknown>) {
  if (
    causa instanceof Prisma.PrismaClientKnownRequestError &&
    causa.code === "P2002"
  ) {
    return createErroApp({
      codigo: "CONFLITO",
      mensagem: "Já existe locatário com esse identificador único.",
      detalhes: { ...contexto, prismaCode: causa.code, target: causa.meta?.target },
      causa,
    });
  }

  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Erro de infraestrutura em locatários.",
    detalhes: contexto,
    causa,
  });
}
