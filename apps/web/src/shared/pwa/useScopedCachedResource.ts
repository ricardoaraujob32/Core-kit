// apps/web/src/shared/pwa/useScopedCachedResource.ts

import { useMemo } from "react";
import { buildPwaCacheKey } from "./pwaScope";
import { usePwaScope } from "./PwaScopeProvider";
import { useCachedResource } from "./useCachedResource";
import type { CachedResourceState } from "./pwaSyncTypes";

type UseScopedCachedResourceOptions<TData> = {
  cacheKey: string;
  initialData: TData;
  load: () => Promise<TData>;
  autoLoad?: boolean;
  preferCacheFirst?: boolean;
};

export function useScopedCachedResource<TData>({
  cacheKey,
  initialData,
  load,
  autoLoad = true,
  preferCacheFirst = true,
}: UseScopedCachedResourceOptions<TData>): CachedResourceState<TData> {
  const { scope } = usePwaScope();

  const scopedCacheKey = useMemo(
    () => buildPwaCacheKey(scope, cacheKey),
    [scope, cacheKey],
  );

  return useCachedResource<TData>({
    cacheKey: scopedCacheKey,
    initialData,
    load,
    autoLoad,
    preferCacheFirst,
  });
}
