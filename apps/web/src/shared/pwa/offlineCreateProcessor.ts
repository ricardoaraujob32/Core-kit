// apps/web/src/shared/pwa/offlineCreateProcessor.ts

import { clientesApi } from "../../features/tenant-admin/clientes/api/clientesApi";
import { comprasApi } from "../../features/tenant-admin/compras/api/comprasApi";
import { fornecedoresApi } from "../../features/tenant-admin/fornecedores/api/fornecedoresApi";
import { ordensServicoApi } from "../../features/tenant-admin/ordens-servico/api/ordensServicoApi";
import { produtosApi } from "../../features/tenant-admin/produtos/api/produtosApi";
import { transacoesApi } from "../../features/tenant-admin/transacoes/api/transacoesApi";
import { vendasApi } from "../../features/tenant-admin/vendas/api/vendasApi";
import { offlineIdMap, resolveOfflineId } from "./offlineIdMap";
import type { CriarOrdemServicoOfflinePayload } from "./offlineOsTypes";
import type {
  CriarCompraOfflinePayload,
  CriarVendaOfflinePayload,
} from "./offlineTransacaoTypes";
import type {
  AdicionarItemTransacaoOfflinePayload,
  AtualizarItemTransacaoOfflinePayload,
  RemoverItemTransacaoOfflinePayload,
} from "./offlineTransacaoItemTypes";
import type { PwaQueueItem } from "./pwaSyncTypes";

function assertLocalId(item: PwaQueueItem): string {
  if (!item.localId) {
    throw new Error(`Item offline sem localId: ${item.type}`);
  }

  return item.localId;
}

function resolveProdutoOuServicoId(id: string | null | undefined): string | null {
  const comoServico = resolveOfflineId("servico", id);
  const comoProduto = resolveOfflineId("produto", comoServico);

  return comoProduto;
}

function assertResolvedId(id: string | null, label: string): string {
  if (!id) {
    throw new Error(`ID obrigatório não resolvido: ${label}`);
  }

  return id;
}

export async function offlineCreateProcessor(item: PwaQueueItem) {
  switch (item.type) {
    case "clientes.criar": {
      const response = await clientesApi.criar(item.payload as never);

      offlineIdMap.register({
        kind: "cliente",
        localId: assertLocalId(item),
        remoteId: response.item.clienteId,
      });

      return;
    }

    case "fornecedores.criar": {
      const response = await fornecedoresApi.criar(item.payload as never);

      offlineIdMap.register({
        kind: "fornecedor",
        localId: assertLocalId(item),
        remoteId: response.item.fornecedorId,
      });

      return;
    }

    case "servicos.criar": {
      const response = await produtosApi.criar(item.payload as never);

      offlineIdMap.register({
        kind: "servico",
        localId: assertLocalId(item),
        remoteId: response.item.produtoId,
      });

      return;
    }

    case "ordensServico.criar": {
      const payload = item.payload as CriarOrdemServicoOfflinePayload;

      const clienteId = resolveOfflineId("cliente", payload.clienteId);
      const servicoId = resolveOfflineId("servico", payload.servicoId);

      const response = await ordensServicoApi.criar({
        ...payload,
        clienteId,
        servicoId,
      });

      if (item.localId) {
        offlineIdMap.register({
          kind: "ordemServico",
          localId: item.localId,
          remoteId: response.item.ordemServicoId,
        });
      }

      return;
    }

    case "vendas.criar": {
      const payload = item.payload as CriarVendaOfflinePayload;
      const clienteId = resolveOfflineId("cliente", payload.clienteId);

      const response = await vendasApi.criar({
        ...payload,
        clienteId,
      });

      if (item.localId) {
        offlineIdMap.register({
          kind: "transacao",
          localId: item.localId,
          remoteId: response.item.transacaoId,
        });
      }

      return;
    }

    case "compras.criar": {
      const payload = item.payload as CriarCompraOfflinePayload;
      const fornecedorId = resolveOfflineId("fornecedor", payload.fornecedorId);

      const response = await comprasApi.criar({
        ...payload,
        fornecedorId,
      });

      if (item.localId) {
        offlineIdMap.register({
          kind: "transacao",
          localId: item.localId,
          remoteId: response.item.transacaoId,
        });
      }

      return;
    }

    case "transacoes.itens.adicionar": {
      const payload = item.payload as AdicionarItemTransacaoOfflinePayload;

      const transacaoId = assertResolvedId(
        resolveOfflineId("transacao", payload.transacaoId),
        "transacaoId",
      );

      const produtoId = assertResolvedId(
        resolveProdutoOuServicoId(payload.produtoId),
        "produtoId",
      );

      const response = await transacoesApi.adicionarItem(transacaoId, {
        produtoId,
        quantidade: payload.quantidade,
        valorUnitario: payload.valorUnitario ?? undefined,
        valorDesconto: payload.valorDesconto ?? undefined,
        descricao: payload.descricao ?? undefined,
      });

      if (item.localId && response.item?.itemTransacaoId) {
        offlineIdMap.register({
          kind: "produto",
          localId: item.localId,
          remoteId: response.item.itemTransacaoId,
        });
      }

      return;
    }

    case "transacoes.itens.atualizar": {
      const payload = item.payload as AtualizarItemTransacaoOfflinePayload;

      const transacaoId = assertResolvedId(
        resolveOfflineId("transacao", payload.transacaoId),
        "transacaoId",
      );

      const itemTransacaoId = assertResolvedId(
        resolveOfflineId("produto", payload.itemTransacaoId),
        "itemTransacaoId",
      );

      await transacoesApi.atualizarItem(transacaoId, itemTransacaoId, {
        quantidade: payload.quantidade,
        valorUnitario: payload.valorUnitario,
        valorDesconto: payload.valorDesconto,
        descricao: payload.descricao,
      });

      return;
    }

    case "transacoes.itens.remover": {
      const payload = item.payload as RemoverItemTransacaoOfflinePayload;

      const transacaoId = assertResolvedId(
        resolveOfflineId("transacao", payload.transacaoId),
        "transacaoId",
      );

      const itemTransacaoId = assertResolvedId(
        resolveOfflineId("produto", payload.itemTransacaoId),
        "itemTransacaoId",
      );

      await transacoesApi.removerItem(transacaoId, itemTransacaoId);

      return;
    }

    default:
      throw new Error(`Tipo de mutação offline não suportado: ${item.type}`);
  }
}
