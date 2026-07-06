// apps/web/src/features/tenant-admin/clientes/hooks/useClientesPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { useClientesCached } from "./useClientesCached";
import type { Cliente } from "../tipos";

export function useClientesPwaList() {
  const resource = useClientesCached();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: Cliente) => item.clienteId, []);

  const data = useMergePwaPendingItems<Cliente>({
    items: resource.data,
    pendingItems: pending.clientes as Cliente[],
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
