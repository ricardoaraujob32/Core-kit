// apps/web/src/shared/pwa/pwaSyncEvents.ts

import type { PwaQueueItem } from "./pwaSyncTypes";

export const PWA_ITEM_SYNCED_EVENT = "corekit:pwa:item-synced";
export const PWA_SYNC_COMPLETED_EVENT = "corekit:pwa:sync-completed";
export const PWA_CACHE_INVALIDATED_EVENT = "corekit:pwa:cache-invalidated";

export type PwaItemSyncedEventDetail = {
  item: PwaQueueItem;
  syncedAt: string;
};

export type PwaSyncCompletedEventDetail = {
  syncedAt: string;
};

export type PwaCacheInvalidatedEventDetail = {
  keys: string[];
  reason: string;
  at: string;
};

export function emitPwaItemSynced(item: PwaQueueItem) {
  window.dispatchEvent(
    new CustomEvent<PwaItemSyncedEventDetail>(PWA_ITEM_SYNCED_EVENT, {
      detail: {
        item,
        syncedAt: new Date().toISOString(),
      },
    }),
  );
}

export function emitPwaSyncCompleted() {
  window.dispatchEvent(
    new CustomEvent<PwaSyncCompletedEventDetail>(PWA_SYNC_COMPLETED_EVENT, {
      detail: {
        syncedAt: new Date().toISOString(),
      },
    }),
  );
}

export function emitPwaCacheInvalidated(params: {
  keys: string[];
  reason: string;
}) {
  window.dispatchEvent(
    new CustomEvent<PwaCacheInvalidatedEventDetail>(
      PWA_CACHE_INVALIDATED_EVENT,
      {
        detail: {
          keys: params.keys,
          reason: params.reason,
          at: new Date().toISOString(),
        },
      },
    ),
  );
}
