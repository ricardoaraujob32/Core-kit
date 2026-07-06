// apps/web/src/shared/pwa/AuthAwareOfflineSyncBootstrap.tsx

import { useEffect, useMemo, useRef } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { refreshPwaAuthSession } from "./pwaAuthRefresh";
import { retryAuthBlockedQueueItems } from "./pwaAuthRetryQueue";
import { sanitizeScopedOfflineQueue } from "./pwaQueueSanitizer";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaScope } from "./PwaScopeProvider";
import { usePwaAuthSession } from "./usePwaAuthSession";
import { useOnlineStatus } from "./useOnlineStatus";

export function AuthAwareOfflineSyncBootstrap() {
  const { scope } = usePwaScope();
  const { isOnline } = useOnlineStatus();
  const auth = usePwaAuthSession();

  const refreshAttemptedRef = useRef(false);

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const processor = useMemo(() => createScopedOfflineProcessor(scope), [scope]);

  useEffect(() => {
    async function run() {
      if (!isOnline) return;

      sanitizeScopedOfflineQueue(scope);

      const hasSyncableItems = queue
        .list()
        .some((item) => item.status === "pending" || item.status === "failed");

      if (!hasSyncableItems) return;

      if (!auth.isAuthenticated) {
        if (refreshAttemptedRef.current) return;

        refreshAttemptedRef.current = true;

        const refreshed = await refreshPwaAuthSession();

        if (!refreshed.ok) return;

        retryAuthBlockedQueueItems(scope);
        sanitizeScopedOfflineQueue(scope);
      }

      await queue.process(processor);
    }

    void run();
  }, [auth.isAuthenticated, isOnline, processor, queue, scope]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      refreshAttemptedRef.current = false;
    }
  }, [auth.isAuthenticated]);

  return null;
}
