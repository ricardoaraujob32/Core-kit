// apps/api/src/infra/prisma/dashboard/dashboardResumoRepositorioPrisma.ts

import type { PrismaClient } from "@prisma/client";
import type { DashboardResumoDto } from "../../../modules/dashboard/dashboard.dto.js";

function inicioDoMesAtual(): Date {
  const agora = new Date();
  return new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), 1, 0, 0, 0, 0));
}

function decimalParaNumero(valor: unknown): number {
  if (valor === null || valor === undefined) return 0;
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") {
    const convertido = Number(valor);
    return Number.isFinite(convertido) ? convertido : 0;
  }
  if (
    typeof valor === "object" &&
    "toNumber" in valor &&
    typeof valor.toNumber === "function"
  ) {
    return valor.toNumber();
  }
  const convertido = Number(valor);
  return Number.isFinite(convertido) ? convertido : 0;
}

export function createDashboardResumoRepositorioPrisma(db: PrismaClient) {
  return {
    async obterResumo(params: { locatarioId: string }): Promise<DashboardResumoDto> {
      const inicioMes = inicioDoMesAtual();

      const [
        clientes,
        fornecedores,
        produtos,
        estoques,
        ordensServicoAbertas,
        vendasMesQuantidade,
        comprasMesQuantidade,
        vendasMesAgregado,
        comprasMesAgregado,
      ] = await Promise.all([
        db.clientes.count({ where: { locatario_id: params.locatarioId, excluido_em: null } }),
        db.fornecedores.count({ where: { locatario_id: params.locatarioId, excluido_em: null } }),
        db.produtos.count({ where: { locatario_id: params.locatarioId, excluido_em: null, ativo: true } }),
        db.estoques.count({ where: { locatario_id: params.locatarioId, excluido_em: null } }),
        db.ordens_servico.count({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            status: { in: ["ABERTA", "EM_ANDAMENTO", "AGUARDANDO"] },
          },
        }),
        db.transacoes.count({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            tipo: "VENDA",
            criado_em: { gte: inicioMes },
          },
        }),
        db.transacoes.count({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            tipo: "COMPRA",
            criado_em: { gte: inicioMes },
          },
        }),
        db.transacoes.aggregate({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            tipo: "VENDA",
            criado_em: { gte: inicioMes },
          },
          _sum: { valor_total: true },
        }),
        db.transacoes.aggregate({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            tipo: "COMPRA",
            criado_em: { gte: inicioMes },
          },
          _sum: { valor_total: true },
        }),
      ]);

      return {
        clientes,
        fornecedores,
        produtos,
        estoques,
        ordensServicoAbertas,
        vendasMes: {
          quantidade: vendasMesQuantidade,
          valor: decimalParaNumero(vendasMesAgregado._sum.valor_total),
        },
        comprasMes: {
          quantidade: comprasMesQuantidade,
          valor: decimalParaNumero(comprasMesAgregado._sum.valor_total),
        },
      };
    },
  };
}
