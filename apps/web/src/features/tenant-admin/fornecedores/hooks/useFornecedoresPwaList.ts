// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedoresPwaList.ts

import { useCallback, useMemo } from "react";
import { useMergePwaPendingItems } from "../../../../shared/pwa/useMergePwaPendingItems";
import { usePwaPendingProjections } from "../../../../shared/pwa/usePwaPendingProjections";
import { useFornecedoresCached } from "./useFornecedoresCached";
import type { Fornecedor } from "../tipos";

export function useFornecedoresPwaList() {
  const resource = useFornecedoresCached();
  const pending = usePwaPendingProjections();

  const getId = useCallback((item: Fornecedor) => item.fornecedorId, []);

  const data = useMergePwaPendingItems<Fornecedor>({
    items: resource.data,
    pendingItems: pending.fornecedores as Fornecedor[],
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
