// apps/web/src/shared/pwa/useScopedOfflineMutationQueue.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaScope } from "./PwaScopeProvider";
import { useOnlineStatus } from "./useOnlineStatus";
import type { PwaQueueItem, PwaQueueProcessor } from "./pwaSyncTypes";

export function useScopedOfflineMutationQueue(
  processor?: PwaQueueProcessor,
) {
  const { scope, scopeKey } = usePwaScope();
  const { isOnline, isOffline } = useOnlineStatus();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const defaultProcessor = useMemo(
    () => createScopedOfflineProcessor(scope),
    [scope],
  );

  const activeProcessor = processor ?? defaultProcessor;

  const [items, setItems] = useState<PwaQueueItem[]>(() => queue.list());
  const [isSyncing, setIsSyncing] = useState(false);

  const refresh = useCallback(() => {
    setItems(queue.list());
  }, [queue]);

  const enqueue = useCallback(
    <TPayload,>(params: {
      type: string;
      payload: TPayload;
      localId?: string | null;
    }) => {
      const item = queue.enqueue(params);
      refresh();
      return item;
    },
    [queue, refresh],
  );

  const sync = useCallback(async () => {
    if (!isOnline) return;

    setIsSyncing(true);

    try {
      await queue.process(activeProcessor);
      refresh();
    } finally {
      setIsSyncing(false);
    }
  }, [activeProcessor, isOnline, queue, refresh]);

  useEffect(() => {
    refresh();
  }, [refresh, scopeKey]);

  useEffect(() => {
    if (isOnline) {
      void sync();
    }
  }, [isOnline, sync]);

  return {
    items,
    pendingCount: items.length,
    isOnline,
    isOffline,
    isSyncing,
    enqueue,
    sync,
    refresh,
    clear: () => {
      queue.clear();
      refresh();
    },
  };
}
