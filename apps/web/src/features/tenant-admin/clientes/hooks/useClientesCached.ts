// apps/web/src/features/tenant-admin/clientes/hooks/useClientesCached.ts

import { useCallback } from "react";
import {
  PWA_RESOURCE_CACHE_KEYS,
} from "../../../../shared/pwa/pwaCacheInvalidation";
import { useReloadOnPwaInvalidation } from "../../../../shared/pwa/useReloadOnPwaInvalidation";
import { useScopedCachedResource } from "../../../../shared/pwa/useScopedCachedResource";
import { clientesApi } from "../api/clientesApi";
import type { Cliente } from "../tipos";

export function useClientesCached() {
  const load = useCallback(async () => {
    const response = await clientesApi.listar();
    return response.itens;
  }, []);

  const resource = useScopedCachedResource<Cliente[]>({
    cacheKey: PWA_RESOURCE_CACHE_KEYS.clientes,
    initialData: [],
    load,
  });

  useReloadOnPwaInvalidation({
    keys: [PWA_RESOURCE_CACHE_KEYS.clientes],
    reload: resource.reload,
  });

  return resource;
}
