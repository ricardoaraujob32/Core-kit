// apps/web/src/shared/pwa/OfflineSyncStatus.tsx

import { useOfflineMutationQueue } from "./useOfflineMutationQueue";
import { offlineCreateProcessor } from "./offlineCreateProcessor";

export function OfflineSyncStatus() {
  const queue = useOfflineMutationQueue(offlineCreateProcessor);

  if (queue.pendingCount === 0 && !queue.isOffline && !queue.isSyncing) {
    return null;
  }

  return (
    <div className="ck-register-alert">
      {queue.isOffline ? "Você está offline. " : null}
      {queue.pendingCount > 0
        ? `${queue.pendingCount} item(ns) aguardando sincronização. `
        : null}
      {queue.isSyncing ? "Sincronizando pendências..." : null}

      {queue.isOnline && queue.pendingCount > 0 ? (
        <button type="button" onClick={() => void queue.sync()}>
          Sincronizar agora
        </button>
      ) : null}
    </div>
  );
}
