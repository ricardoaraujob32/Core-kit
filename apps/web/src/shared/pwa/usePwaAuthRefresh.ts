// apps/web/src/shared/pwa/usePwaAuthRefresh.ts

import { useCallback, useState } from "react";
import {
  refreshPwaAuthSession,
  type PwaAuthRefreshResult,
} from "./pwaAuthRefresh";

export function usePwaAuthRefresh() {
  const [isRefreshingAuth, setIsRefreshingAuth] = useState(false);
  const [lastRefreshResult, setLastRefreshResult] =
    useState<PwaAuthRefreshResult | null>(null);

  const refreshAuth = useCallback(async () => {
    setIsRefreshingAuth(true);

    try {
      const result = await refreshPwaAuthSession();
      setLastRefreshResult(result);
      return result;
    } finally {
      setIsRefreshingAuth(false);
    }
  }, []);

  return {
    isRefreshingAuth,
    lastRefreshResult,
    refreshAuth,
  };
}
