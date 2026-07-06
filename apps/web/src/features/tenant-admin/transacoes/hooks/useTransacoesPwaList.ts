// apps/web/src/features/tenant-admin/transacoes/hooks/useTransacoesPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { useTransacoes } from "./useTransacoes";
import type { Transacao } from "../tipos";

export function useTransacoesPwaList() {
  const resource = useTransacoes();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: Transacao) => item.transacaoId, []);

  const data = useMergePwaPendingItems<Transacao>({
    items: resource.transacoes ?? [],
    pendingItems: pending.transacoes as Transacao[],
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      transacoes: data,
      data,
    }),
    [resource, data],
  );
}
