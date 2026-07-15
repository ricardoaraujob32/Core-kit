// apps/web/src/features/tenant-admin/produtos/hooks/useProdutosPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useProdutosCached, useServicosCached } from "./useProdutosCached";
import type { Produto } from "../tipos";

function isProduto(value: Produto | null): value is Produto {
  return value !== null;
}

function withLocatarioId(
  produtos: Array<Record<string, unknown> | null>,
  locatarioId: string | null | undefined,
): Produto[] {
  if (!locatarioId) return [];

  return produtos
    .map((produto) =>
      produto
        ? ({
            ...produto,
            locatarioId,
          } as Produto)
        : null,
    )
    .filter(isProduto);
}

export function useProdutosPwaList() {
  const resource = useProdutosCached();
  const pending = usePwaPendingProjections();
  const { scope } = usePwaScope();

  const getId = useCallback((item: Produto) => item.produtoId, []);

  const pendingItems = useMemo(
    () => withLocatarioId(pending.produtos, scope.locatarioId),
    [pending.produtos, scope.locatarioId],
  );

  const data = useMergePwaPendingItems<Produto>({
    items: resource.data,
    pendingItems,
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
  const { scope } = usePwaScope();

  const getId = useCallback((item: Produto) => item.produtoId, []);

  const pendingItems = useMemo(
    () => withLocatarioId(pending.servicos, scope.locatarioId),
    [pending.servicos, scope.locatarioId],
  );

  const data = useMergePwaPendingItems<Produto>({
    items: resource.data,
    pendingItems,
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
