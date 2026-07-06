// apps/web/src/shared/pwa/useCachedResource.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../core/errors/mapError";
import { offlineStorage } from "./offlineStorage";
import { useOnlineStatus } from "./useOnlineStatus";
import type { CachedResourceState } from "./pwaSyncTypes";

type UseCachedResourceOptions<TData> = {
  cacheKey: string;
  initialData: TData;
  load: () => Promise<TData>;
  autoLoad?: boolean;
  preferCacheFirst?: boolean;
};

export function useCachedResource<TData>({
  cacheKey,
  initialData,
  load,
  autoLoad = true,
  preferCacheFirst = true,
}: UseCachedResourceOptions<TData>): CachedResourceState<TData> {
  const { isOnline } = useOnlineStatus();

  const cached = offlineStorage.getCache<TData>(cacheKey);

  const [data, setData] = useState<TData>(cached?.data ?? initialData);
  const [updatedAt, setUpdatedAt] = useState<string | null>(
    cached?.updatedAt ?? null,
  );
  const [isFromCache, setIsFromCache] = useState(Boolean(cached));
  const [isLoading, setIsLoading] = useState(autoLoad && !cached);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const currentCache = offlineStorage.getCache<TData>(cacheKey);

    if (!isOnline) {
      if (currentCache) {
        setData(currentCache.data);
        setUpdatedAt(currentCache.updatedAt);
        setIsFromCache(true);
        setError(null);
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      setError("Sem conexão e sem dados em cache.");
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    setError(null);

    if (preferCacheFirst && currentCache) {
      setData(currentCache.data);
      setUpdatedAt(currentCache.updatedAt);
      setIsFromCache(true);
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const fresh = await load();
      const record = offlineStorage.setCache(cacheKey, fresh);

      setData(record.data);
      setUpdatedAt(record.updatedAt);
      setIsFromCache(false);
    } catch (cause) {
      const fallbackCache = offlineStorage.getCache<TData>(cacheKey);

      if (fallbackCache) {
        setData(fallbackCache.data);
        setUpdatedAt(fallbackCache.updatedAt);
        setIsFromCache(true);
      }

      setError(mapError(cause).message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [cacheKey, isOnline, load, preferCacheFirst]);

  useEffect(() => {
    if (autoLoad) {
      void reload();
    }
  }, [autoLoad, reload]);

  return {
    data,
    isLoading,
    isRefreshing,
    isFromCache,
    error,
    updatedAt,
    reload,
  };
}
