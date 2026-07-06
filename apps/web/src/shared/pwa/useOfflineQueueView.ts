// apps/web/src/shared/pwa/useOfflineQueueView.ts

import { useCallback, useMemo, useState } from "react";
import { offlineQueue } from "./offlineQueue";
import { offlineCreateProcessor } from "./offlineCreateProcessor";
import { useOnlineStatus } from "./useOnlineStatus";
import type { PwaQueueItem } from "./pwaSyncTypes";

function sortQueueItems(items: PwaQueueItem[]): PwaQueueItem[] {
  return [...items].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
}

export function useOfflineQueueView() {
  const { isOnline, isOffline } = useOnlineStatus();

  const [items, setItems] = useState<PwaQueueItem[]>(() =>
    sortQueueItems(offlineQueue.list()),
  );
  const [isSyncing, setIsSyncing] = useState(false);

  const pendingItems = useMemo(
    () => items.filter((item) => item.status === "pending"),
    [items],
  );

  const failedItems = useMemo(
    () => items.filter((item) => item.status === "failed"),
    [items],
  );

  const blockedItems = useMemo(
    () => items.filter((item) => item.status === "blocked"),
    [items],
  );

  const syncingItems = useMemo(
    () => items.filter((item) => item.status === "syncing"),
    [items],
  );

  const refresh = useCallback(() => {
    setItems(sortQueueItems(offlineQueue.list()));
  }, []);

  const sync = useCallback(async () => {
    if (!isOnline) return;

    setIsSyncing(true);

    try {
      await offlineQueue.process(offlineCreateProcessor);
      refresh();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, refresh]);

  const remove = useCallback(
    (id: string) => {
      offlineQueue.remove(id);
      refresh();
    },
    [refresh],
  );

  const retry = useCallback(
    (id: string) => {
      offlineQueue.update(id, {
        status: "pending",
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });
      refresh();
    },
    [refresh],
  );

  const block = useCallback(
    (id: string) => {
      offlineQueue.block(id);
      refresh();
    },
    [refresh],
  );

  const unblock = useCallback(
    (id: string) => {
      offlineQueue.unblock(id);
      refresh();
    },
    [refresh],
  );

  const clear = useCallback(() => {
    offlineQueue.clear();
    refresh();
  }, [refresh]);

  return {
    items,
    pendingItems,
    failedItems,
    blockedItems,
    syncingItems,
    pendingCount: pendingItems.length,
    failedCount: failedItems.length,
    blockedCount: blockedItems.length,
    syncingCount: syncingItems.length,
    totalCount: items.length,
    isOnline,
    isOffline,
    isSyncing,
    refresh,
    sync,
    remove,
    retry,
    block,
    unblock,
    clear,
  };
}
