// apps/web/src/shared/pwa/pwaAuthRetryQueue.ts

import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import type { PwaScope } from "./pwaScope";

export function retryAuthBlockedQueueItems(scope: PwaScope) {
  const queue = createScopedOfflineQueue(scope);

  for (const item of queue.list()) {
    if (
      item.status === "blocked" &&
      (item.lastErrorKind === "permission" ||
        item.lastError?.toLowerCase().includes("401") ||
        item.lastError?.toLowerCase().includes("unauthorized"))
    ) {
      queue.update(item.id, {
        status: "pending",
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });
    }
  }
}
