// apps/api/src/infra/prisma/financeiro/financeiroTransacoesConsultaRepositorioPrisma.ts

import type {
  ContaFinanceira,
  ErroApp,
  FinanceiroTransacoesConsultaRepositorio,
  FiltroStatusContaFinanceira,
  ListarContasFinanceirasInput,
  LocatarioId,
  ObterResumoFinanceiroInput,
  Result,
  ResumoFinanceiro,
  TipoContaFinanceira,
} from "@core-kit/core";
import { wrapOk } from "@core-kit/core";
import type { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";

type DecimalLike = { toString(): string } | number | string | null | undefined;

type TransacaoFinanceiraRow = {
  transacao_id: string;
  locatario_id: string;
  cliente_id: string | null;
  fornecedor_id: string | null;
  tipo: string;
  status: string;
  valor_total: DecimalLike;
  observacao: string | null;
  vencimento_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
};

const STATUS_FINANCEIRO_ABERTO_DB = "EM_PROCESSAMENTO";
const STATUS_FINANCEIRO_LIQUIDADO_DB = "CONCLUIDA";

const transacaoFinanceiraSelect = {
  transacao_id: true,
  locatario_id: true,
  cliente_id: true,
  fornecedor_id: true,
  tipo: true,
  status: true,
  valor_total: true,
  observacao: true,
  vencimento_em: true,
  criado_em: true,
  atualizado_em: true,
} as const;

function numberFromDecimal(value: DecimalLike, fallback = 0): number {
  if (value === null || value === undefined) return fallback;

  const numero = typeof value === "number" ? value : Number(value.toString());
  return Number.isFinite(numero) ? numero : fallback;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfNextMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function mapStatusConta(statusDb: string): "ABERTO" | "LIQUIDADO" {
  return statusDb === STATUS_FINANCEIRO_LIQUIDADO_DB ? "LIQUIDADO" : "ABERTO";
}

function mapConta(row: TransacaoFinanceiraRow, tipo: TipoContaFinanceira): ContaFinanceira {
  return {
    transacaoId: row.transacao_id,
    locatarioId: row.locatario_id as LocatarioId,
    tipo,
    status: mapStatusConta(row.status),
    clienteId: row.cliente_id,
    fornecedorId: row.fornecedor_id,
    descricao: row.observacao,
    valor: numberFromDecimal(row.valor_total),
    vencimentoEm: row.vencimento_em ?? row.criado_em,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  };
}

function statusWhere(status?: FiltroStatusContaFinanceira) {
  if (!status || status === "TODOS") {
    return { in: [STATUS_FINANCEIRO_ABERTO_DB, STATUS_FINANCEIRO_LIQUIDADO_DB] };
  }

  return status === "LIQUIDADO" ? STATUS_FINANCEIRO_LIQUIDADO_DB : STATUS_FINANCEIRO_ABERTO_DB;
}

function periodoVencimentoWhere(input: ListarContasFinanceirasInput, hoje: Date) {
  const where: Record<string, unknown> = {};

  if (input.vencidas) {
    where.lt = startOfDay(hoje);
  }

  if (input.dataInicial) {
    where.gte = input.dataInicial;
  }

  if (input.dataFinal) {
    where.lte = input.dataFinal;
  }

  return Object.keys(where).length > 0 ? where : undefined;
}

async function listarContas(
  db: PrismaDb,
  input: ListarContasFinanceirasInput,
  tipoTransacao: "VENDA" | "COMPRA",
  tipoConta: TipoContaFinanceira,
): Promise<Result<ContaFinanceira[], ErroApp>> {
  try {
    const vencimentoWhere = periodoVencimentoWhere(input, new Date());

    const rows = await db.transacoes.findMany({
      where: {
        locatario_id: input.locatarioId,
        tipo: tipoTransacao,
        excluido_em: null,
        status: statusWhere(input.status),
        ...(vencimentoWhere ? { vencimento_em: vencimentoWhere } : {}),
      },
      orderBy: [{ vencimento_em: "asc" }, { transacao_id: "asc" }],
      ...(input.cursor
        ? {
            cursor: {
              locatario_id_transacao_id: {
                locatario_id: input.locatarioId,
                transacao_id: input.cursor,
              },
            },
            skip: 1,
          }
        : {}),
      take: input.limite ?? 50,
      select: transacaoFinanceiraSelect,
    });

    return wrapOk(rows.map((row) => mapConta(row as TransacaoFinanceiraRow, tipoConta)));
  } catch (causa) {
    return mapearErroInfra(causa, {
      entidade: "transacoes",
      operacao: `infra.financeiro.${tipoConta === "RECEBER" ? "listarContasReceber" : "listarContasPagar"}`,
      detalhes: input,
    });
  }
}

async function somarTransacoes(
  db: PrismaDb,
  params: {
    locatarioId: string;
    tipo: "VENDA" | "COMPRA";
    status: string;
    vencimentoAntesDe?: Date;
    atualizadoDe?: Date;
    atualizadoAte?: Date;
  },
): Promise<{ total: number; quantidade: number }> {
  const rows = await db.transacoes.findMany({
    where: {
      locatario_id: params.locatarioId,
      tipo: params.tipo,
      status: params.status,
      excluido_em: null,
      ...(params.vencimentoAntesDe ? { vencimento_em: { lt: params.vencimentoAntesDe } } : {}),
      ...(params.atualizadoDe || params.atualizadoAte
        ? {
            atualizado_em: {
              ...(params.atualizadoDe ? { gte: params.atualizadoDe } : {}),
              ...(params.atualizadoAte ? { lt: params.atualizadoAte } : {}),
            },
          }
        : {}),
    },
    select: {
      valor_total: true,
    },
  });

  return {
    total: rows.reduce((acc, row) => acc + numberFromDecimal(row.valor_total), 0),
    quantidade: rows.length,
  };
}

export function createFinanceiroTransacoesConsultaRepositorioPrisma(db: PrismaDb): FinanceiroTransacoesConsultaRepositorio {
  return {
    async obterResumoFinanceiro(input: ObterResumoFinanceiroInput): Promise<Result<ResumoFinanceiro, ErroApp>> {
      const hoje = input.hoje ?? new Date();
      const inicioPeriodo = input.periodo?.inicio ?? startOfMonth(hoje);
      const fimPeriodo = input.periodo?.fim ?? startOfNextMonth(hoje);
      const hojeInicio = startOfDay(hoje);

      try {
        const [aReceber, aPagar, recebidoPeriodo, pagoPeriodo, vencidoReceber, vencidoPagar] = await Promise.all([
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "VENDA",
            status: STATUS_FINANCEIRO_ABERTO_DB,
          }),
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "COMPRA",
            status: STATUS_FINANCEIRO_ABERTO_DB,
          }),
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "VENDA",
            status: STATUS_FINANCEIRO_LIQUIDADO_DB,
            atualizadoDe: inicioPeriodo,
            atualizadoAte: fimPeriodo,
          }),
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "COMPRA",
            status: STATUS_FINANCEIRO_LIQUIDADO_DB,
            atualizadoDe: inicioPeriodo,
            atualizadoAte: fimPeriodo,
          }),
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "VENDA",
            status: STATUS_FINANCEIRO_ABERTO_DB,
            vencimentoAntesDe: hojeInicio,
          }),
          somarTransacoes(db, {
            locatarioId: input.locatarioId,
            tipo: "COMPRA",
            status: STATUS_FINANCEIRO_ABERTO_DB,
            vencimentoAntesDe: hojeInicio,
          }),
        ]);

        return wrapOk({
          locatarioId: input.locatarioId,
          totalAReceber: aReceber.total,
          totalAPagar: aPagar.total,
          saldoPrevisto: aReceber.total - aPagar.total,
          totalRecebidoPeriodo: recebidoPeriodo.total,
          totalPagoPeriodo: pagoPeriodo.total,
          totalVencidoReceber: vencidoReceber.total,
          totalVencidoPagar: vencidoPagar.total,
          quantidadeVencidosReceber: vencidoReceber.quantidade,
          quantidadeVencidosPagar: vencidoPagar.quantidade,
          geradoEm: new Date(),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "transacoes",
          operacao: "infra.financeiro.obterResumoFinanceiro",
          detalhes: input,
        });
      }
    },

    listarContasReceber(input) {
      return listarContas(db, input, "VENDA", "RECEBER");
    },

    listarContasPagar(input) {
      return listarContas(db, input, "COMPRA", "PAGAR");
    },
  };
}
