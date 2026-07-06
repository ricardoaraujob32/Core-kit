// apps/web/src/shared/pwa/usePwaSyncEvents.ts

import { useEffect } from "react";
import {
  PWA_CACHE_INVALIDATED_EVENT,
  PWA_ITEM_SYNCED_EVENT,
  PWA_SYNC_COMPLETED_EVENT,
  type PwaCacheInvalidatedEventDetail,
  type PwaItemSyncedEventDetail,
  type PwaSyncCompletedEventDetail,
} from "./pwaSyncEvents";

type UsePwaSyncEventsOptions = {
  onItemSynced?: (detail: PwaItemSyncedEventDetail) => void;
  onSyncCompleted?: (detail: PwaSyncCompletedEventDetail) => void;
  onCacheInvalidated?: (detail: PwaCacheInvalidatedEventDetail) => void;
};

export function usePwaSyncEvents({
  onItemSynced,
  onSyncCompleted,
  onCacheInvalidated,
}: UsePwaSyncEventsOptions) {
  useEffect(() => {
    function handleItemSynced(event: Event) {
      onItemSynced?.((event as CustomEvent<PwaItemSyncedEventDetail>).detail);
    }

    function handleSyncCompleted(event: Event) {
      onSyncCompleted?.(
        (event as CustomEvent<PwaSyncCompletedEventDetail>).detail,
      );
    }

    function handleCacheInvalidated(event: Event) {
      onCacheInvalidated?.(
        (event as CustomEvent<PwaCacheInvalidatedEventDetail>).detail,
      );
    }

    window.addEventListener(PWA_ITEM_SYNCED_EVENT, handleItemSynced);
    window.addEventListener(PWA_SYNC_COMPLETED_EVENT, handleSyncCompleted);
    window.addEventListener(
      PWA_CACHE_INVALIDATED_EVENT,
      handleCacheInvalidated,
    );

    return () => {
      window.removeEventListener(PWA_ITEM_SYNCED_EVENT, handleItemSynced);
      window.removeEventListener(PWA_SYNC_COMPLETED_EVENT, handleSyncCompleted);
      window.removeEventListener(
        PWA_CACHE_INVALIDATED_EVENT,
        handleCacheInvalidated,
      );
    };
  }, [onItemSynced, onSyncCompleted, onCacheInvalidated]);
}
