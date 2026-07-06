// apps/web/src/shared/pwa/useScopedOfflineQueueView.ts

import { useCallback, useMemo, useState } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { sanitizeScopedOfflineQueue } from "./pwaQueueSanitizer";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaScope } from "./PwaScopeProvider";
import { useOnlineStatus } from "./useOnlineStatus";
import type { PwaQueueItem } from "./pwaSyncTypes";

function sortQueueItems(items: PwaQueueItem[]): PwaQueueItem[] {
  return [...items].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function useScopedOfflineQueueView() {
  const { scope } = usePwaScope();
  const { isOnline, isOffline } = useOnlineStatus();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const processor = useMemo(() => createScopedOfflineProcessor(scope), [scope]);

  const [items, setItems] = useState<PwaQueueItem[]>(() =>
    sortQueueItems(queue.list()),
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
    setItems(sortQueueItems(queue.list()));
  }, [queue]);

  const sanitize = useCallback(() => {
    const report = sanitizeScopedOfflineQueue(scope);
    refresh();
    return report;
  }, [scope, refresh]);

  const sync = useCallback(async () => {
    if (!isOnline) return;

    setIsSyncing(true);

    try {
      sanitizeScopedOfflineQueue(scope);
      await queue.process(processor);
      refresh();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, processor, queue, refresh, scope]);

  const remove = useCallback(
    (id: string) => {
      queue.remove(id);
      refresh();
    },
    [queue, refresh],
  );

  const retry = useCallback(
    (id: string) => {
      queue.update(id, {
        status: "pending",
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });
      sanitizeScopedOfflineQueue(scope);
      refresh();
    },
    [queue, refresh, scope],
  );

  const block = useCallback(
    (id: string) => {
      queue.block(id);
      refresh();
    },
    [queue, refresh],
  );

  const unblock = useCallback(
    (id: string) => {
      queue.unblock(id);
      sanitizeScopedOfflineQueue(scope);
      refresh();
    },
    [queue, refresh, scope],
  );

  const clear = useCallback(() => {
    queue.clear();
    refresh();
  }, [queue, refresh]);

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
    sanitize,
    sync,
    remove,
    retry,
    block,
    unblock,
    clear,
  };
}
