// apps/web/src/shared/pwa/useOfflineMutationQueue.ts

import { useCallback, useEffect, useState } from "react";
import { offlineQueue } from "./offlineQueue";
import { useOnlineStatus } from "./useOnlineStatus";
import type { PwaQueueItem, PwaQueueProcessor } from "./pwaSyncTypes";

export function useOfflineMutationQueue(processor?: PwaQueueProcessor) {
  const { isOnline, isOffline } = useOnlineStatus();
  const [items, setItems] = useState<PwaQueueItem[]>(() => offlineQueue.list());
  const [isSyncing, setIsSyncing] = useState(false);

  function refresh() {
    setItems(offlineQueue.list());
  }

  const enqueue = useCallback(
    <TPayload,>(params: { type: string; payload: TPayload }) => {
      const item = offlineQueue.enqueue(params);
      refresh();
      return item;
    },
    [],
  );

  const sync = useCallback(async () => {
    if (!processor || !isOnline) return;

    setIsSyncing(true);

    try {
      await offlineQueue.process(processor);
      refresh();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, processor]);

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (isOnline && processor) {
      void sync();
    }
  }, [isOnline, processor, sync]);

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
      offlineQueue.clear();
      refresh();
    },
  };
}
