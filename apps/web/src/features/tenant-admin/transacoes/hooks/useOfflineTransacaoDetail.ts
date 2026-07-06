// apps/web/src/features/tenant-admin/transacoes/hooks/useOfflineTransacaoDetail.ts

import { useCallback } from "react";
import { useOfflineEntityDetail } from "../../../../shared/pwa/useOfflineEntityDetail";
import type {
  AtualizarItemTransacaoInput,
  Transacao,
  TransacaoItem,
} from "../tipos";

function recalcularTotais(itens: TransacaoItem[]) {
  const valorSubtotal = itens.reduce(
    (total, item) => total + Number(item.valorSubtotal ?? 0),
    0,
  );

  const valorDesconto = itens.reduce(
    (total, item) => total + Number(item.valorDesconto ?? 0),
    0,
  );

  const valorTotal = itens.reduce(
    (total, item) => total + Number(item.valorTotal ?? 0),
    0,
  );

  return {
    valorSubtotal,
    valorDesconto,
    valorTotal,
  };
}

export function useOfflineTransacaoDetail(
  transacaoId?: string | null,
  fallback?: Transacao | null,
) {
  const detail = useOfflineEntityDetail<Transacao>({
    kind: "transacao",
    id: transacaoId,
    fallback,
  });

  const salvarTransacao = useCallback(
    (transacao: Transacao) => {
      detail.save({
        ...transacao,
        atualizadoEm: new Date().toISOString(),
      });
    },
    [detail],
  );

  const adicionarItemLocal = useCallback(
    (item: TransacaoItem) => {
      if (!detail.detail) return;

      const itens = [item, ...(detail.detail.itens ?? [])];
      const totais = recalcularTotais(itens);

      salvarTransacao({
        ...detail.detail,
        ...totais,
        itens,
      });
    },
    [detail.detail, salvarTransacao],
  );

  const atualizarItemLocal = useCallback(
    (itemTransacaoId: string, input: AtualizarItemTransacaoInput) => {
      if (!detail.detail) return;

      const itens = (detail.detail.itens ?? []).map((item) => {
        if (item.itemTransacaoId !== itemTransacaoId) return item;

        const quantidade = Number(input.quantidade ?? item.quantidade) || 1;
        const valorUnitario = Number(input.valorUnitario ?? item.valorUnitario) || 0;
        const valorDesconto = Number(input.valorDesconto ?? item.valorDesconto) || 0;
        const valorSubtotal = quantidade * valorUnitario;
        const valorTotal = Math.max(valorSubtotal - valorDesconto, 0);

        return {
          ...item,
          ...input,
          quantidade,
          valorUnitario,
          valorDesconto,
          valorSubtotal,
          valorTotal,
          atualizadoEm: new Date().toISOString(),
        };
      });

      const totais = recalcularTotais(itens);

      salvarTransacao({
        ...detail.detail,
        ...totais,
        itens,
      });
    },
    [detail.detail, salvarTransacao],
  );

  const removerItemLocal = useCallback(
    (itemTransacaoId: string) => {
      if (!detail.detail) return;

      const itens = (detail.detail.itens ?? []).filter(
        (item) => item.itemTransacaoId !== itemTransacaoId,
      );

      const totais = recalcularTotais(itens);

      salvarTransacao({
        ...detail.detail,
        ...totais,
        itens,
      });
    },
    [detail.detail, salvarTransacao],
  );

  return {
    ...detail,
    transacao: detail.detail,
    salvarTransacao,
    adicionarItemLocal,
    atualizarItemLocal,
    removerItemLocal,
  };
}
