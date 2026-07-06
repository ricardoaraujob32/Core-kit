// apps/web/src/shared/pwa/useEditScopedQueueItem.ts

import { useCallback, useMemo } from "react";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaScope } from "./PwaScopeProvider";
import type { PwaQueueItem } from "./pwaSyncTypes";

export function useEditScopedQueueItem() {
  const { scope } = usePwaScope();
  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);

  const getItem = useCallback(
    (id: string): PwaQueueItem | null =>
      queue.list().find((item) => item.id === id) ?? null,
    [queue],
  );

  const updatePayload = useCallback(
    (id: string, payload: unknown) => {
      queue.update(id, {
        payload,
        status: "pending",
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });
    },
    [queue],
  );

  return {
    getItem,
    updatePayload,
  };
}
