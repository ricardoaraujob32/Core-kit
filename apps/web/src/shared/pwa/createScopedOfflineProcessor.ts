// apps/web/src/shared/pwa/createScopedOfflineProcessor.ts

import { clientesApi } from "../../features/tenant-admin/clientes/api/clientesApi";
import { comprasApi } from "../../features/tenant-admin/compras/api/comprasApi";
import { fornecedoresApi } from "../../features/tenant-admin/fornecedores/api/fornecedoresApi";
import { ordensServicoApi } from "../../features/tenant-admin/ordens-servico/api/ordensServicoApi";
import { produtosApi } from "../../features/tenant-admin/produtos/api/produtosApi";
import { transacoesApi } from "../../features/tenant-admin/transacoes/api/transacoesApi";
import { vendasApi } from "../../features/tenant-admin/vendas/api/vendasApi";
import { isOfflineEntityId } from "./createOfflineEntity";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { validateAndNormalizePwaPayload } from "./pwaPayloadValidation";
import type { PwaScope } from "./pwaScope";
import type { OfflineEntityKind } from "./offlineIdMap";
import type { PwaQueueItem } from "./pwaSyncTypes";

function assertLocalId(item: PwaQueueItem): string {
  if (!item.localId) {
    throw new Error(`Item offline sem localId: ${item.type}`);
  }

  return item.localId;
}

class ScopedOfflineDependencyNotResolvedError extends Error {
  code = "DEPENDENCIA_OFFLINE_NAO_RESOLVIDA";

  constructor(kind: OfflineEntityKind, localId: string) {
    super(`Dependência offline ainda não resolvida: ${kind}:${localId}`);
  }
}

function resolveRequired(params: {
  idMap: ReturnType<typeof createScopedOfflineIdMap>;
  kind: OfflineEntityKind;
  id: string | null | undefined;
  label: string;
}): string {
  if (!params.id) {
    throw new Error(`ID obrigatório ausente: ${params.label}`);
  }

  const resolved = params.idMap.resolve(params.kind, params.id);

  if (!resolved) {
    throw new Error(`ID obrigatório não resolvido: ${params.label}`);
  }

  if (isOfflineEntityId(resolved)) {
    throw new ScopedOfflineDependencyNotResolvedError(params.kind, resolved);
  }

  return resolved;
}

function resolveOptional(params: {
  idMap: ReturnType<typeof createScopedOfflineIdMap>;
  kind: OfflineEntityKind;
  id: string | null | undefined;
}): string | null {
  if (!params.id) return null;

  const resolved = params.idMap.resolve(params.kind, params.id);

  if (resolved && isOfflineEntityId(resolved)) {
    throw new ScopedOfflineDependencyNotResolvedError(params.kind, resolved);
  }

  return resolved;
}

function resolveProdutoOuServicoId(
  idMap: ReturnType<typeof createScopedOfflineIdMap>,
  id: string | null | undefined,
): string | null {
  const comoServico = idMap.resolve("servico", id);
  const comoProduto = idMap.resolve("produto", comoServico);

  return comoProduto;
}

export function createScopedOfflineProcessor(scope: PwaScope) {
  const idMap = createScopedOfflineIdMap(scope);

  return async function scopedOfflineProcessor(item: PwaQueueItem) {
    const normalizedItem: PwaQueueItem = {
      ...item,
      payload: validateAndNormalizePwaPayload(item),
    };

    switch (normalizedItem.type) {
      case "clientes.criar": {
        const response = await clientesApi.criar(normalizedItem.payload as never);

        idMap.register({
          kind: "cliente",
          localId: assertLocalId(normalizedItem),
          remoteId: response.item.clienteId,
        });

        return;
      }

      case "fornecedores.criar": {
        const response = await fornecedoresApi.criar(
          normalizedItem.payload as never,
        );

        idMap.register({
          kind: "fornecedor",
          localId: assertLocalId(normalizedItem),
          remoteId: response.item.fornecedorId,
        });

        return;
      }

      case "servicos.criar": {
        const response = await produtosApi.criar(normalizedItem.payload as never);

        idMap.register({
          kind: "servico",
          localId: assertLocalId(normalizedItem),
          remoteId: response.item.produtoId,
        });

        return;
      }

      case "ordensServico.criar": {
        const payload = normalizedItem.payload as {
          usuarioId: string;
          clienteId?: string | null;
          servicoId?: string | null;
          titulo: string;
          descricao?: string | null;
        };

        const clienteId = resolveOptional({
          idMap,
          kind: "cliente",
          id: payload.clienteId,
        });

        const servicoId = resolveOptional({
          idMap,
          kind: "servico",
          id: payload.servicoId,
        });

        const response = await ordensServicoApi.criar({
          usuarioId: payload.usuarioId,
          clienteId,
          servicoId,
          titulo: payload.titulo,
          descricao: payload.descricao ?? null,
        });

        if (normalizedItem.localId) {
          idMap.register({
            kind: "ordemServico",
            localId: normalizedItem.localId,
            remoteId: response.item.ordemServicoId,
          });
        }

        return;
      }

      case "vendas.criar": {
        const payload = normalizedItem.payload as {
          clienteId?: string | null;
          observacao?: string | null;
        };

        const clienteId = resolveOptional({
          idMap,
          kind: "cliente",
          id: payload.clienteId,
        });

        const response = await vendasApi.criar({
          ...payload,
          clienteId,
        });

        if (normalizedItem.localId) {
          idMap.register({
            kind: "transacao",
            localId: normalizedItem.localId,
            remoteId: response.item.transacaoId,
          });
        }

        return;
      }

      case "compras.criar": {
        const payload = normalizedItem.payload as {
          fornecedorId?: string | null;
          observacao?: string | null;
        };

        const fornecedorId = resolveOptional({
          idMap,
          kind: "fornecedor",
          id: payload.fornecedorId,
        });

        const response = await comprasApi.criar({
          ...payload,
          fornecedorId,
        });

        if (normalizedItem.localId) {
          idMap.register({
            kind: "transacao",
            localId: normalizedItem.localId,
            remoteId: response.item.transacaoId,
          });
        }

        return;
      }

      case "transacoes.itens.adicionar": {
        const payload = normalizedItem.payload as {
          transacaoId: string;
          produtoId: string;
          quantidade: number;
          valorUnitario: number;
          valorDesconto: number;
          descricao?: string | null;
        };

        const transacaoId = resolveRequired({
          idMap,
          kind: "transacao",
          id: payload.transacaoId,
          label: "transacaoId",
        });

        const produtoId = resolveProdutoOuServicoId(idMap, payload.produtoId);

        if (!produtoId || isOfflineEntityId(produtoId)) {
          throw new ScopedOfflineDependencyNotResolvedError(
            "servico",
            String(payload.produtoId),
          );
        }

        const response = await transacoesApi.adicionarItem(transacaoId, {
          produtoId,
          quantidade: payload.quantidade,
          valorUnitario: payload.valorUnitario,
          valorDesconto: payload.valorDesconto,
          descricao: payload.descricao ?? undefined,
        });

        if (normalizedItem.localId && response.item?.itemTransacaoId) {
          idMap.register({
            kind: "produto",
            localId: normalizedItem.localId,
            remoteId: response.item.itemTransacaoId,
          });
        }

        return;
      }

      case "transacoes.itens.atualizar": {
        const payload = normalizedItem.payload as {
          transacaoId: string;
          itemTransacaoId: string;
          quantidade: number;
          valorUnitario: number;
          valorDesconto: number;
          descricao?: string | null;
        };

        const transacaoId = resolveRequired({
          idMap,
          kind: "transacao",
          id: payload.transacaoId,
          label: "transacaoId",
        });

        const itemTransacaoId = resolveRequired({
          idMap,
          kind: "produto",
          id: payload.itemTransacaoId,
          label: "itemTransacaoId",
        });

        await transacoesApi.atualizarItem(transacaoId, itemTransacaoId, {
          quantidade: payload.quantidade,
          valorUnitario: payload.valorUnitario,
          valorDesconto: payload.valorDesconto,
          descricao: payload.descricao ?? null,
        });

        return;
      }

      case "transacoes.itens.remover": {
        const payload = normalizedItem.payload as {
          transacaoId: string;
          itemTransacaoId: string;
        };

        const transacaoId = resolveRequired({
          idMap,
          kind: "transacao",
          id: payload.transacaoId,
          label: "transacaoId",
        });

        const itemTransacaoId = resolveRequired({
          idMap,
          kind: "produto",
          id: payload.itemTransacaoId,
          label: "itemTransacaoId",
        });

        await transacoesApi.removerItem(transacaoId, itemTransacaoId);
        return;
      }

      default:
        throw new Error(
          `Tipo de mutação offline não suportado: ${normalizedItem.type}`,
        );
    }
  };
}
