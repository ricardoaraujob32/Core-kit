// apps/web/src/features/tenant-admin/produtos/hooks/useProdutosPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { useProdutosCached, useServicosCached } from "./useProdutosCached";
import type { Produto } from "../tipos";

export function useProdutosPwaList() {
  const resource = useProdutosCached();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: Produto) => item.produtoId, []);

  const data = useMergePwaPendingItems<Produto>({
    items: resource.data,
    pendingItems: pending.produtos as Produto[],
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      data,
    }),
    [resource, data],
  );
}

export function useServicosPwaList() {
  const resource = useServicosCached();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: Produto) => item.produtoId, []);

  const data = useMergePwaPendingItems<Produto>({
    items: resource.data,
    pendingItems: pending.servicos as Produto[],
    getId,
  });

  return useMemo(
    () => ({
      ...resource,
      data,
    }),
    [resource, data],
  );
}
