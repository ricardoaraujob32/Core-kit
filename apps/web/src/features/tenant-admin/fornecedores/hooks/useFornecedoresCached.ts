// apps/web/src/features/tenant-admin/fornecedores/hooks/useFornecedoresCached.ts

import { useCallback } from "react";
import {
  PWA_RESOURCE_CACHE_KEYS,
} from "../../../../shared/pwa/pwaCacheInvalidation";
import { useReloadOnPwaInvalidation } from "../../../../shared/pwa/useReloadOnPwaInvalidation";
import { useScopedCachedResource } from "../../../../shared/pwa/useScopedCachedResource";
import { fornecedoresApi } from "../api/fornecedoresApi";
import type { Fornecedor } from "../tipos";

export function useFornecedoresCached() {
  const load = useCallback(async () => {
    const response = await fornecedoresApi.listar();
    return response.itens;
  }, []);

  const resource = useScopedCachedResource<Fornecedor[]>({
    cacheKey: PWA_RESOURCE_CACHE_KEYS.fornecedores,
    initialData: [],
    load,
  });

  useReloadOnPwaInvalidation({
    keys: [PWA_RESOURCE_CACHE_KEYS.fornecedores],
    reload: resource.reload,
  });

  return resource;
}
