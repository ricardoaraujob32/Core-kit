// apps/web/src/shared/pwa/usePendingQueueItems.ts

import { useMemo } from "react";
import { useScopedOfflineQueueView } from "./useScopedOfflineQueueView";

type UsePendingQueueItemsOptions = {
  types?: string[];
  localId?: string | null;
};

export function usePendingQueueItems({
  types,
  localId,
}: UsePendingQueueItemsOptions = {}) {
  const queue = useScopedOfflineQueueView();

  const items = useMemo(() => {
    return queue.items.filter((item) => {
      if (types?.length && !types.includes(item.type)) return false;
      if (localId && item.localId !== localId) return false;
      return true;
    });
  }, [queue.items, types, localId]);

  return {
    ...queue,
    items,
    count: items.length,
  };
}
