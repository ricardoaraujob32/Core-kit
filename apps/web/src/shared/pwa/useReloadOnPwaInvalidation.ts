// apps/web/src/shared/pwa/useReloadOnPwaInvalidation.ts

import { useCallback } from "react";
import { usePwaSyncEvents } from "./usePwaSyncEvents";

type UseReloadOnPwaInvalidationOptions = {
  keys: string[];
  reload: () => Promise<void> | void;
};

export function useReloadOnPwaInvalidation({
  keys,
  reload,
}: UseReloadOnPwaInvalidationOptions) {
  const handleCacheInvalidated = useCallback(
    (detail: { keys: string[] }) => {
      const shouldReload = detail.keys.some((key) => keys.includes(key));

      if (shouldReload) {
        void reload();
      }
    },
    [keys, reload],
  );

  usePwaSyncEvents({
    onCacheInvalidated: handleCacheInvalidated,
  });
}
