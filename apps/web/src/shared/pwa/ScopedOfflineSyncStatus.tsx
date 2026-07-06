// apps/web/src/shared/pwa/ScopedOfflineSyncStatus.tsx

import { useScopedOfflineMutationQueue } from "./useScopedOfflineMutationQueue";

export function ScopedOfflineSyncStatus() {
  const queue = useScopedOfflineMutationQueue();

  if (queue.pendingCount === 0 && !queue.isOffline && !queue.isSyncing) {
    return null;
  }

  return (
    <div className="ck-register-alert">
      {queue.isOffline ? "Você está offline. " : null}
      {queue.pendingCount > 0
        ? `${queue.pendingCount} item(ns) aguardando sincronização neste usuário/locatário. `
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
