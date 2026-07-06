// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacaoItensPwa.ts

import { useState } from "react";
import { mapError } from "../../../../core/errors/mapError";
import { createOfflineId } from "../../../../shared/pwa/createOfflineEntity";
import { useValidatedScopedOfflineEnqueue } from "../../../../shared/pwa/useValidatedScopedOfflineEnqueue";
import { useOnlineStatus } from "../../../../shared/pwa/useOnlineStatus";
import { transacoesApi } from "../api/transacoesApi";
import type {
  AdicionarItemTransacaoInput,
  AtualizarItemTransacaoInput,
  TransacaoItem,
} from "../tipos";

type UseTransacaoItensPwaParams = {
  transacaoId: string;
  onLocalItemAdded?: (item: TransacaoItem) => void;
  onLocalItemUpdated?: (
    itemTransacaoId: string,
    input: AtualizarItemTransacaoInput,
  ) => void;
  onLocalItemRemoved?: (itemTransacaoId: string) => void;
  reload?: () => Promise<void> | void;
};

function calcularItemLocal(input: AdicionarItemTransacaoInput): TransacaoItem {
  const quantidade = Number(input.quantidade) || 1;
  const valorUnitario = Number(input.valorUnitario) || 0;
  const valorDesconto = Number(input.valorDesconto) || 0;
  const valorSubtotal = quantidade * valorUnitario;
  const valorTotal = Math.max(valorSubtotal - valorDesconto, 0);

  return {
    itemTransacaoId: createOfflineId("itemTransacao"),
    produtoId: input.produtoId,
    descricao: input.descricao ?? "Item pendente",
    tipoProduto: "PENDENTE",
    quantidade,
    valorUnitario,
    valorSubtotal,
    valorDesconto,
    valorTotal,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  } as TransacaoItem;
}

export function useTransacaoItensPwa({
  transacaoId,
  onLocalItemAdded,
  onLocalItemUpdated,
  onLocalItemRemoved,
  reload,
}: UseTransacaoItensPwaParams) {
  const { isOffline } = useOnlineStatus();
  const { enqueue } = useValidatedScopedOfflineEnqueue();

  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function adicionar(input: AdicionarItemTransacaoInput) {
    setError(null);
    setIsRunning("adicionar-item");

    try {
      if (isOffline) {
        const itemLocal = calcularItemLocal(input);

        const queued = enqueue({
          type: "transacoes.itens.adicionar",
          payload: {
            transacaoId,
            produtoId: input.produtoId,
            quantidade: Number(input.quantidade) || 1,
            valorUnitario: input.valorUnitario ?? null,
            valorDesconto: input.valorDesconto ?? null,
            descricao: input.descricao ?? null,
          },
          localId: itemLocal.itemTransacaoId,
        });

        if (!queued.ok) {
          setError(queued.error);
          return null;
        }

        onLocalItemAdded?.(itemLocal);
        return itemLocal;
      }

      await transacoesApi.adicionarItem(transacaoId, input);
      await reload?.();
      return null;
    } catch (cause) {
      setError(mapError(cause).message);
      return null;
    } finally {
      setIsRunning(null);
    }
  }

  async function atualizar(
    itemTransacaoId: string,
    input: AtualizarItemTransacaoInput,
  ) {
    setError(null);
    setIsRunning("atualizar-item");

    try {
      if (isOffline) {
        const queued = enqueue({
          type: "transacoes.itens.atualizar",
          payload: {
            transacaoId,
            itemTransacaoId,
            quantidade: input.quantidade,
            valorUnitario: input.valorUnitario,
            valorDesconto: input.valorDesconto,
            descricao: input.descricao ?? null,
          },
        });

        if (!queued.ok) {
          setError(queued.error);
          return;
        }

        onLocalItemUpdated?.(itemTransacaoId, input);
        return;
      }

      await transacoesApi.atualizarItem(transacaoId, itemTransacaoId, input);
      await reload?.();
    } catch (cause) {
      setError(mapError(cause).message);
    } finally {
      setIsRunning(null);
    }
  }

  async function remover(itemTransacaoId: string) {
    setError(null);
    setIsRunning("remover-item");

    try {
      if (isOffline) {
        const queued = enqueue({
          type: "transacoes.itens.remover",
          payload: {
            transacaoId,
            itemTransacaoId,
          },
        });

        if (!queued.ok) {
          setError(queued.error);
          return;
        }

        onLocalItemRemoved?.(itemTransacaoId);
        return;
      }

      await transacoesApi.removerItem(transacaoId, itemTransacaoId);
      await reload?.();
    } catch (cause) {
      setError(mapError(cause).message);
    } finally {
      setIsRunning(null);
    }
  }

  return {
    adicionar,
    atualizar,
    remover,
    isRunning,
    error,
    isOffline,
  };
}
