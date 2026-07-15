// apps/web/src/shared/pwa/offlineCreateProcessor.ts

import { clientesApi } from "../../features/tenant-admin/clientes/api/clientesApi";
import { comprasApi } from "../../features/tenant-admin/compras/api/comprasApi";
import { fornecedoresApi } from "../../features/tenant-admin/fornecedores/api/fornecedoresApi";
import { ordensServicoApi } from "../../features/tenant-admin/ordens-servico/api/ordensServicoApi";
import { produtosApi } from "../../features/tenant-admin/produtos/api/produtosApi";
import { transacoesApi } from "../../features/tenant-admin/transacoes/api/transacoesApi";
import { vendasApi } from "../../features/tenant-admin/vendas/api/vendasApi";
import type { PwaQueueItem } from "./pwaSyncTypes";

export async function offlineCreateProcessor(item: PwaQueueItem): Promise<void> {
  switch (item.type) {
    case "clientes.criar": {
      await clientesApi.criar(item.payload as never);
      return;
    }

    case "fornecedores.criar": {
      await fornecedoresApi.criar(item.payload as never);
      return;
    }

    case "servicos.criar": {
      await produtosApi.criar(item.payload as never);
      return;
    }

    case "vendas.criar": {
      await vendasApi.criar(item.payload as never);
      return;
    }

    case "compras.criar": {
      await comprasApi.criar(item.payload as never);
      return;
    }

    case "ordensServico.criar": {
      const payload = item.payload as {
        usuarioId: string;
        clienteId?: string | null;
        servicoId?: string | null;
        titulo: string;
        descricao?: string | null;
      };

      await ordensServicoApi.criar({
        usuarioId: payload.usuarioId,
        clienteId: payload.clienteId ?? null,
        servicoId: payload.servicoId ?? null,
        titulo: payload.titulo,
        descricao: payload.descricao ?? null,
      });

      return;
    }

    case "transacoes.itens.adicionar": {
      const payload = item.payload as {
        transacaoId: string;
        produtoId: string;
        quantidade: number;
        valorUnitario?: number | null;
        valorDesconto?: number | null;
        descricao?: string | null;
      };

      await transacoesApi.adicionarItem(payload.transacaoId, {
        produtoId: payload.produtoId,
        quantidade: Number(payload.quantidade) || 1,
        valorUnitario: Number(payload.valorUnitario ?? 0),
        valorDesconto: Number(payload.valorDesconto ?? 0),
        descricao: payload.descricao ?? undefined,
      });

      return;
    }

    case "transacoes.itens.atualizar": {
      const payload = item.payload as {
        transacaoId: string;
        itemTransacaoId: string;
        quantidade?: number;
        valorUnitario?: number;
        valorDesconto?: number;
        descricao?: string | null;
      };

      await transacoesApi.atualizarItem(
        payload.transacaoId,
        payload.itemTransacaoId,
        {
          quantidade: payload.quantidade,
          valorUnitario: payload.valorUnitario,
          valorDesconto: payload.valorDesconto,
          descricao: payload.descricao ?? null,
        },
      );

      return;
    }

    case "transacoes.itens.remover": {
      const payload = item.payload as {
        transacaoId: string;
        itemTransacaoId: string;
      };

      await transacoesApi.removerItem(
        payload.transacaoId,
        payload.itemTransacaoId,
      );

      return;
    }

    default:
      throw new Error(`Tipo de mutação offline não suportado: ${item.type}`);
  }
}
