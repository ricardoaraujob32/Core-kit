// apps/web/src/features/tenant-admin/clientes/hooks/useClientesPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useClientesCached } from "./useClientesCached";
import type { Cliente } from "../tipos";

function isCliente(value: Cliente | null): value is Cliente {
  return value !== null;
}

export function useClientesPwaList() {
  const resource = useClientesCached();
  const pending = usePwaPendingProjections();
  const { scope } = usePwaScope();

  const getId = useCallback((item: Cliente) => item.clienteId, []);

  const pendingItems = useMemo(
    () =>
      pending.clientes
        .map((cliente) =>
          cliente
            ? ({
                ...cliente,
                locatarioId: scope.locatarioId,
              } as Cliente)
            : null,
        )
        .filter(isCliente),
    [pending.clientes, scope.locatarioId],
  );

  const data = useMergePwaPendingItems<Cliente>({
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
