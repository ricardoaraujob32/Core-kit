// apps/web/src/features/tenant-admin/produtos/hooks/useProdutosCached.ts

import { useCallback } from "react";
import {
  PWA_RESOURCE_CACHE_KEYS,
} from "../../../../shared/pwa/pwaCacheInvalidation";
import { useReloadOnPwaInvalidation } from "../../../../shared/pwa/useReloadOnPwaInvalidation";
import { useScopedCachedResource } from "../../../../shared/pwa/useScopedCachedResource";
import { produtosApi } from "../api/produtosApi";
import type { Produto } from "../tipos";

export function useProdutosCached() {
  const load = useCallback(async () => {
    const response = await produtosApi.listar();
    return response.itens;
  }, []);

  const resource = useScopedCachedResource<Produto[]>({
    cacheKey: PWA_RESOURCE_CACHE_KEYS.produtos,
    initialData: [],
    load,
  });

  useReloadOnPwaInvalidation({
    keys: [PWA_RESOURCE_CACHE_KEYS.produtos],
    reload: resource.reload,
  });

  return resource;
}

export function useServicosCached() {
  const load = useCallback(async () => {
    const response = await produtosApi.listar();
    return response.itens.filter((item) => item.tipo === "SERVICO");
  }, []);

  const resource = useScopedCachedResource<Produto[]>({
    cacheKey: PWA_RESOURCE_CACHE_KEYS.servicos,
    initialData: [],
    load,
  });

  useReloadOnPwaInvalidation({
    keys: [
      PWA_RESOURCE_CACHE_KEYS.produtos,
      PWA_RESOURCE_CACHE_KEYS.servicos,
    ],
    reload: resource.reload,
  });

  return resource;
}
