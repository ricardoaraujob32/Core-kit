// apps/web/src/shared/pwa/PwaSyncCenterSummary.tsx

import { useMemo } from "react";
import { formatBytes, getPwaStorageUsage } from "./pwaStorageUsage";
import { useOnlineStatus } from "./useOnlineStatus";
import { usePwaAuthSession } from "./usePwaAuthSession";
import { usePwaScope } from "./PwaScopeProvider";
import { useScopedOfflineQueueView } from "./useScopedOfflineQueueView";

export function PwaSyncCenterSummary() {
  const { scopeKey } = usePwaScope();
  const { isOnline, isOffline } = useOnlineStatus();
  const auth = usePwaAuthSession();
  const queue = useScopedOfflineQueueView();

  const usage = useMemo(() => getPwaStorageUsage(), []);

  return (
    <section className="ck-sync-center-hero">
      <div>
        <div className="ck-register-kicker">PWA</div>
        <h1 className="ck-register-title">Central de Sincronização</h1>
        <p className="ck-register-description">
          Controle de fila offline, sincronização, diagnóstico, recuperação e dados locais.
        </p>
      </div>

      <section className="ck-sync-center-summary-grid">
        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Conexão</div>
          <div className="ck-register-stat-value">
            {isOnline ? "Online" : isOffline ? "Offline" : "—"}
          </div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Sessão</div>
          <div className="ck-register-stat-value">
            {auth.isAuthenticated ? "Válida" : "Inválida"}
          </div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Pendentes</div>
          <div className="ck-register-stat-value">{queue.pendingCount}</div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Falhas</div>
          <div className="ck-register-stat-value">{queue.failedCount}</div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Bloqueadas</div>
          <div className="ck-register-stat-value">{queue.blockedCount}</div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Uso local</div>
          <div className="ck-register-stat-value">
            {formatBytes(usage.totalBytes)}
          </div>
        </article>
      </section>

      <div className="ck-sync-center-scope">
        <strong>Escopo:</strong> <code>{scopeKey}</code>
      </div>

      {!auth.isAuthenticated ? (
        <div className="ck-register-alert">
          Sessão local inválida. Faça login novamente antes de sincronizar pendências.
        </div>
      ) : null}
    </section>
  );
}
