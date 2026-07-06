// apps/web/src/shared/pwa/useAsyncResource.ts

import { useCallback, useEffect, useState } from "react";
import { mapError } from "../../core/errors/mapError";
import type { AsyncResource, LoadStatus } from "./pwaTypes";

type UseAsyncResourceOptions<TData> = {
  initialData: TData;
  load: () => Promise<TData>;
  autoLoad?: boolean;
};

export function useAsyncResource<TData>({
  initialData,
  load,
  autoLoad = true,
}: UseAsyncResourceOptions<TData>): AsyncResource<TData> {
  const [data, setData] = useState<TData>(initialData);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const result = await load();
      setData(result);
      setStatus("success");
    } catch (cause) {
      setError(mapError(cause).message);
      setStatus("error");
    }
  }, [load]);

  useEffect(() => {
    if (autoLoad) {
      void reload();
    }
  }, [autoLoad, reload]);

  return {
    status,
    data,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    reload,
  };
}
