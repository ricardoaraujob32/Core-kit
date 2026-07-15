// apps/web/src/shared/pwa/AuthAwareOfflineSyncStatus.tsx

import { useMemo, useState } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaAuthSession } from "./usePwaAuthSession";
import { usePwaScope } from "./PwaScopeProvider";
import { useOnlineStatus } from "./useOnlineStatus";

export function AuthAwareOfflineSyncStatus() {
  const { scope } = usePwaScope();
  const { isOnline, isOffline } = useOnlineStatus();
  const auth = usePwaAuthSession();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const processor = useMemo(() => createScopedOfflineProcessor(scope), [scope]);

  const [isSyncing, setIsSyncing] = useState(false);
  const items = queue.list();
  const pendingCount = items.filter(
    (item) => item.status === "pending" || item.status === "failed",
  ).length;

  async function sincronizarAgora() {
    if (!isOnline || !auth.isAuthenticated) return;

    setIsSyncing(true);

    try {
      await queue.process(processor);
    } finally {
      setIsSyncing(false);
    }
  }

  if (pendingCount === 0 && !isOffline && auth.isAuthenticated) {
    return null;
  }

  return (
    <div className="ck-register-alert">
      {isOffline ? "Você está offline. " : null}

      {!auth.isAuthenticated ? (
        <>
          Há pendências offline, mas a sessão não está válida.
          Faça login novamente para sincronizar.
          {auth.reason ? ` Motivo: ${auth.reason}` : null}
        </>
      ) : null}

      {auth.isAuthenticated && pendingCount > 0 ? (
        <>
          {pendingCount} pendência(s) aguardando sincronização.
        </>
      ) : null}

      {auth.isAuthenticated && isOnline && pendingCount > 0 ? (
        <button
          className="ck-register-button"
          type="button"
          disabled={isSyncing}
          onClick={() => void sincronizarAgora()}
        >
          {isSyncing ? "Sincronizando..." : "Sincronizar agora"}
        </button>
      ) : null}
    </div>
  );
}
