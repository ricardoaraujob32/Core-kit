// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedoresPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { usePwaScope } from "../../../../shared/pwa/PwaScopeProvider";
import { useFornecedoresCached } from "./useFornecedoresCached";
import type { Fornecedor } from "../tipos";

function isFornecedor(value: Fornecedor | null): value is Fornecedor {
  return value !== null;
}

export function useFornecedoresPwaList() {
  const resource = useFornecedoresCached();
  const pending = usePwaPendingProjections();
  const { scope } = usePwaScope();

  const getId = useCallback((item: Fornecedor) => item.fornecedorId, []);

  const pendingItems = useMemo(
    () =>
      pending.fornecedores
        .map((fornecedor) =>
          fornecedor
            ? ({
                ...fornecedor,
                locatarioId: scope.locatarioId,
              } as Fornecedor)
            : null,
        )
        .filter(isFornecedor),
    [pending.fornecedores, scope.locatarioId],
  );

  const data = useMergePwaPendingItems<Fornecedor>({
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
