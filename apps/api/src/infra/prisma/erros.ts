// apps/api/src/infra/prisma/erros.ts

import { Prisma } from "@prisma/client";
import { createErroApp } from "@core-kit/core"; 

/**
 * Mapeia erros conhecidos do Prisma para `ErroApp`.
 *
 * Regras atuais:
 * - `P2002` -> `CONFLITO`
 * - `P2025` -> `NAO_ENCONTRADO`
 * - demais casos -> `ERRO_INTERNO`
 *
 * @param causa Erro técnico original.
 * @param contexto Metadados da operação para diagnóstico.
 * @returns `Err(ErroApp)` padronizado.
 */
export function mapearErroInfra(
  causa: unknown,
  contexto: {
    entidade: string;
    operacao: string;
    detalhes?: Record<string, unknown>;
  }
) {
  if (
    causa instanceof Prisma.PrismaClientKnownRequestError &&
    causa.code === "P2002"
  ) {
    return createErroApp({
      codigo: "CONFLITO",
      mensagem: `Conflito de unicidade em ${contexto.entidade}.`,
      detalhes: {
        ...contexto.detalhes,
        prismaCode: causa.code,
        target: causa.meta?.target,
        entidade: contexto.entidade,
        operacao: contexto.operacao,
      },
      causa,
    });
  }

  if (
    causa instanceof Prisma.PrismaClientKnownRequestError &&
    causa.code === "P2025"
  ) {
    return createErroApp({
      codigo: "NAO_ENCONTRADO",
      mensagem: `Registro não encontrado em ${contexto.entidade}.`,
      detalhes: {
        ...contexto.detalhes,
        prismaCode: causa.code,
        entidade: contexto.entidade,
        operacao: contexto.operacao,
      },
      causa,
    });
  }

  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: `Falha de infraestrutura em ${contexto.entidade}.`,
    detalhes: {
      ...contexto.detalhes,
      entidade: contexto.entidade,
      operacao: contexto.operacao,
    },
    causa,
  });
}