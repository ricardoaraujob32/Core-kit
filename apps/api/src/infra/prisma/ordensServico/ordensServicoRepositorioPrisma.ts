import { createErroApp, type ErroApp, type OrdensServicoRepositorio, type OrdemServico, type Result, wrapOk } from "@core-kit/core";
import type { PrismaClient } from "@prisma/client";

type PrismaLike = PrismaClient;

function toNumberDecimal(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null && "toNumber" in value && typeof (value as { toNumber: () => number }).toNumber === "function") {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

function toOrdemServico(row: any, transacaoId?: string | null): OrdemServico {
  return {
    ordemServicoId: row.ordem_servico_id,
    locatarioId: row.locatario_id,
    clienteId: row.cliente_id ?? null,
    status: row.status,
    titulo: row.titulo,
    descricao: row.descricao ?? null,
    abertaEm: row.aberta_em,
    fechadaEm: row.fechada_em ?? null,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    excluidoEm: row.excluido_em ?? null,
    excluidoPor: row.excluido_por ?? null,
    excluidoMotivo: row.excluido_motivo ?? null,
    transacaoId: transacaoId ?? null,
  };
}

function erroRepositorio(error: unknown, operacao: string): Result<never, ErroApp> {
  return createErroApp({
    codigo: "ERRO_INTERNO",
    mensagem: "Erro ao acessar ordens de serviço.",
    detalhes: { operacao, erro: error instanceof Error ? error.message : String(error) },
  });
}

export function createOrdensServicoRepositorioPrisma(prisma: PrismaLike): OrdensServicoRepositorio {
  return {
    async criar(params) {
      try {
        const row = await prisma.ordens_servico.create({
          data: {
            locatario_id: params.locatarioId,
            cliente_id: params.clienteId ?? null,
            titulo: params.titulo,
            descricao: params.descricao ?? null,
            status: "ABERTA",
          },
        });
        return wrapOk(toOrdemServico(row));
      } catch (error) {
        return erroRepositorio(error, "ordensServico.criar");
      }
    },

    async listar(params) {
      try {
        const take = Math.min(Math.max(params.limite ?? 20, 1), 100);
        const rows = await prisma.ordens_servico.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
            status: params.status,
            cliente_id: params.clienteId === undefined ? undefined : params.clienteId,
            ...(params.cursor
              ? {
                  ordem_servico_id: { lt: params.cursor },
                }
              : {}),
          },
          orderBy: [{ criado_em: "desc" }, { ordem_servico_id: "desc" }],
          take,
        });
        return wrapOk(rows.map((row) => toOrdemServico(row)));
      } catch (error) {
        return erroRepositorio(error, "ordensServico.listar");
      }
    },

    async buscarPorId(params) {
      try {
        const row = await prisma.ordens_servico.findFirst({
          where: {
            locatario_id: params.locatarioId,
            ordem_servico_id: params.ordemServicoId,
            excluido_em: null,
          },
        });
        if (!row) return wrapOk(null);

        const venda = await prisma.transacoes.findFirst({
          where: {
            locatario_id: params.locatarioId,
            ordem_servico_id: params.ordemServicoId,
            tipo: "VENDA",
            excluido_em: null,
          },
          select: { transacao_id: true },
          orderBy: { criado_em: "desc" },
        });

        return wrapOk(toOrdemServico(row, venda?.transacao_id ?? null));
      } catch (error) {
        return erroRepositorio(error, "ordensServico.buscarPorId");
      }
    },

    async atualizar(params) {
      try {
        const row = await prisma.ordens_servico.update({
          where: {
            locatario_id_ordem_servico_id: {
              locatario_id: params.locatarioId,
              ordem_servico_id: params.ordemServicoId,
            },
          },
          data: {
            cliente_id: params.clienteId === undefined ? undefined : params.clienteId,
            titulo: params.titulo,
            descricao: params.descricao === undefined ? undefined : params.descricao,
            atualizado_em: new Date(),
          },
        });
        return wrapOk(toOrdemServico(row));
      } catch (error) {
        return erroRepositorio(error, "ordensServico.atualizar");
      }
    },

    async atualizarStatus(params) {
      try {
        const row = await prisma.ordens_servico.update({
          where: {
            locatario_id_ordem_servico_id: {
              locatario_id: params.locatarioId,
              ordem_servico_id: params.ordemServicoId,
            },
          },
          data: {
            status: params.status,
            fechada_em: params.fechadaEm === undefined ? undefined : params.fechadaEm,
            atualizado_em: new Date(),
          },
        });
        return wrapOk(toOrdemServico(row));
      } catch (error) {
        return erroRepositorio(error, "ordensServico.atualizarStatus");
      }
    },

    async buscarVendaVinculada(params) {
      try {
        const venda = await prisma.transacoes.findFirst({
          where: {
            locatario_id: params.locatarioId,
            ordem_servico_id: params.ordemServicoId,
            tipo: "VENDA",
            excluido_em: null,
          },
          select: { transacao_id: true },
          orderBy: { criado_em: "desc" },
        });
        return wrapOk(venda ? { transacaoId: venda.transacao_id } : null);
      } catch (error) {
        return erroRepositorio(error, "ordensServico.buscarVendaVinculada");
      }
    },

    async criarVendaDaOrdemServico(params) {
      try {
        const venda = await prisma.transacoes.create({
          data: {
            locatario_id: params.locatarioId,
            cliente_id: params.clienteId ?? null,
            fornecedor_id: null,
            ordem_servico_id: params.ordemServicoId,
            tipo: "VENDA",
            origem: "ORDEM_SERVICO",
            valor_subtotal: params.valorTotal,
            valor_desconto: 0,
            valor_acrescimo: 0,
            valor_total: params.valorTotal,
            vencimento_em: params.vencimentoEm,
            status: "ABERTA",
            observacao: params.observacao ?? null,
          },
          select: { transacao_id: true },
        });

        return wrapOk({ transacaoId: venda.transacao_id });
      } catch (error) {
        return erroRepositorio(error, "ordensServico.criarVendaDaOrdemServico");
      }
    },
  };
}
