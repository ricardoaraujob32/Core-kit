// apps/web/src/shared/pwa/AuthAwareOfflineSyncStatus.tsx

import { useMemo, useState } from "react";
import { createScopedOfflineProcessor } from "./createScopedOfflineProcessor";
import { retryAuthBlockedQueueItems } from "./pwaAuthRetryQueue";
import { sanitizeScopedOfflineQueue } from "./pwaQueueSanitizer";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { usePwaScope } from "./PwaScopeProvider";
import { usePwaAuthRefresh } from "./usePwaAuthRefresh";
import { usePwaAuthSession } from "./usePwaAuthSession";
import { useOnlineStatus } from "./useOnlineStatus";

export function AuthAwareOfflineSyncStatus() {
  const { scope } = usePwaScope();
  const { isOnline, isOffline } = useOnlineStatus();
  const auth = usePwaAuthSession();
  const authRefresh = usePwaAuthRefresh();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);
  const processor = useMemo(() => createScopedOfflineProcessor(scope), [scope]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSanitizeMessage, setLastSanitizeMessage] = useState<string | null>(
    null,
  );

  const items = queue.list();

  const pendingCount = items.filter(
    (item) => item.status === "pending" || item.status === "failed",
  ).length;

  const authBlockedCount = items.filter(
    (item) =>
      item.status === "blocked" &&
      (item.lastErrorKind === "permission" ||
        item.lastError?.toLowerCase().includes("401") ||
        item.lastError?.toLowerCase().includes("unauthorized")),
  ).length;

  async function sincronizarAgora() {
    if (!isOnline) return;

    setIsSyncing(true);

    try {
      const sanitizeReport = sanitizeScopedOfflineQueue(scope);

      setLastSanitizeMessage(
        `Saneamento: ${sanitizeReport.normalized} normalizado(s), ${sanitizeReport.blocked} bloqueado(s).`,
      );

      if (!auth.isAuthenticated) {
        const refreshed = await authRefresh.refreshAuth();

        if (!refreshed.ok) return;

        auth.refresh();
      }

      retryAuthBlockedQueueItems(scope);
      sanitizeScopedOfflineQueue(scope);

      await queue.process(processor);
    } finally {
      setIsSyncing(false);
    }
  }

  if (
    pendingCount === 0 &&
    authBlockedCount === 0 &&
    !isOffline &&
    auth.isAuthenticated
  ) {
    return null;
  }

  return (
    <div className="ck-register-alert">
      {isOffline ? "Você está offline. " : null}

      {!auth.isAuthenticated ? (
        <>
          Há pendências offline, mas a sessão não está válida.
          {auth.reason ? ` Motivo: ${auth.reason}` : null}
        </>
      ) : null}

      {pendingCount > 0 ? (
        <> {pendingCount} pendência(s) aguardando sincronização.</>
      ) : null}

      {authBlockedCount > 0 ? (
        <> {authBlockedCount} pendência(s) bloqueada(s) por autenticação.</>
      ) : null}

      {lastSanitizeMessage ? <> {lastSanitizeMessage}</> : null}

      {authRefresh.lastRefreshResult?.reason ? (
        <> Refresh: {authRefresh.lastRefreshResult.reason}</>
      ) : null}

      {isOnline && (pendingCount > 0 || authBlockedCount > 0) ? (
        <button
          className="ck-register-button"
          type="button"
          disabled={isSyncing || authRefresh.isRefreshingAuth}
          onClick={() => void sincronizarAgora()}
        >
          {isSyncing || authRefresh.isRefreshingAuth
            ? "Preparando sincronização..."
            : auth.isAuthenticated
              ? "Sanear e sincronizar"
              : "Renovar sessão e sincronizar"}
        </button>
      ) : null}
    </div>
  );
}
