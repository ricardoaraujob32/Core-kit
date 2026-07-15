// apps/web/src/shared/pwa/AuthAwareOfflineSyncBootstrap.tsx

import { useEffect, useMemo } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaAuthSession } from "./usePwaAuthSession";
import { usePwaScope } from "./PwaScopeProvider";
import { useOnlineStatus } from "./useOnlineStatus";

/**
 * Sincronizador automático consciente de autenticação.
 *
 * Só processa a fila quando:
 * - está online;
 * - há sessão local válida;
 * - existe fila no escopo atual.
 */
export function AuthAwareOfflineSyncBootstrap() {
  const { scope } = usePwaScope();
  const { isOnline } = useOnlineStatus();
  const auth = usePwaAuthSession();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const processor = useMemo(() => createScopedOfflineProcessor(scope), [scope]);

  useEffect(() => {
    if (!isOnline) return;
    if (!auth.isAuthenticated) return;

    const hasSyncableItems = queue
      .list()
      .some((item) => item.status === "pending" || item.status === "failed");

    if (!hasSyncableItems) return;

    void queue.process(processor);
  }, [auth.isAuthenticated, isOnline, processor, queue]);

  return null;
}
