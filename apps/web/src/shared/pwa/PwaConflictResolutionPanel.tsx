// apps/web/src/shared/pwa/PwaConflictResolutionPanel.tsx

import { useMemo } from "react";
import { PwaQueueIssueCard } from "./PwaQueueIssueCard";
import { useScopedOfflineQueueView } from "./useScopedOfflineQueueView";

export function PwaConflictResolutionPanel() {
  const queue = useScopedOfflineQueueView();

  const issueItems = useMemo(
    () =>
      queue.items.filter(
        (item) => item.status === "failed" || item.status === "blocked",
      ),
    [queue.items],
  );

  const blockedCount = issueItems.filter((item) => item.status === "blocked").length;
  const failedCount = issueItems.filter((item) => item.status === "failed").length;

  if (issueItems.length === 0) {
    return null;
  }

  return (
    <section className="ck-register-page">
      <section className="ck-register-hero">
        <div className="ck-register-hero-inner">
          <div>
            <div className="ck-register-kicker">PWA</div>
            <h1 className="ck-register-title">Resolver pendências</h1>
            <p className="ck-register-description">
              Revise, corrija e reenvie pendências que falharam.
            </p>
          </div>

          <div className="ck-register-actions">
            <button
              className="ck-register-action-primary"
              type="button"
              disabled={!queue.isOnline || queue.isSyncing}
              onClick={() => void queue.sync()}
            >
              Tentar sincronizar fila
            </button>

            <button
              className="ck-register-button"
              type="button"
              onClick={queue.refresh}
            >
              Atualizar
            </button>
          </div>
        </div>
      </section>

      <section className="ck-register-stats">
        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Falhas</div>
          <div className="ck-register-stat-value">{failedCount}</div>
        </article>

        <article className="ck-register-stat">
          <div className="ck-register-stat-label">Bloqueadas</div>
          <div className="ck-register-stat-value">{blockedCount}</div>
        </article>
      </section>

      {issueItems.map((item) => (
        <PwaQueueIssueCard
          key={item.id}
          item={item}
          onRetry={queue.retry}
          onUnblock={queue.unblock}
          onRemove={queue.remove}
          onChanged={queue.refresh}
        />
      ))}
    </section>
  );
}
