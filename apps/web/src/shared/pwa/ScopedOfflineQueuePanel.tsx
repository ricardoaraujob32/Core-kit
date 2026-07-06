// apps/web/src/shared/pwa/ScopedOfflineQueuePanel.tsx

import { useState } from "react";
import { useScopedOfflineQueueView } from "./useScopedOfflineQueueView";
import { OfflineQueueTable } from "./OfflineQueueTable";
import { OfflineQueueDetails } from "./OfflineQueueDetails";
import type { PwaQueueItem } from "./pwaSyncTypes";

export function ScopedOfflineQueuePanel() {
  const queue = useScopedOfflineQueueView();
  const [selected, setSelected] = useState<PwaQueueItem | null>(null);

  return (
    <section className="ck-register-page">
      <section className="ck-register-hero">
        <div className="ck-register-hero-inner">
          <div>
            <div className="ck-register-kicker">PWA</div>
            <h1 className="ck-register-title">Sincronização</h1>
            <p className="ck-register-description">
              Pendências offline isoladas por usuário e locatário.
            </p>
          </div>

          <div className="ck-register-actions">
            <button
              className="ck-register-action-primary"
              type="button"
              disabled={!queue.isOnline || queue.isSyncing || queue.totalCount === 0}
              onClick={() => void queue.sync()}
            >
              {queue.isSyncing ? "Sincronizando..." : "Sincronizar agora"}
            </button>

            <button
              className="ck-register-button"
              type="button"
              onClick={queue.refresh}
            >
              Atualizar
            </button>

            <button
              className="ck-register-button"
              type="button"
              disabled={queue.totalCount === 0 || queue.isSyncing}
              onClick={queue.clear}
            >
              Limpar fila deste escopo
            </button>
          </div>
        </div>
      </section>

      <section className="ck-register-stats">
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
          <div className="ck-register-stat-label">Sincronizando</div>
          <div className="ck-register-stat-value">{queue.syncingCount}</div>
        </article>
      </section>

      <OfflineQueueDetails item={selected} onClose={() => setSelected(null)} />

      <OfflineQueueTable
        items={queue.items}
        isOnline={queue.isOnline}
        isSyncing={queue.isSyncing}
        onDetails={setSelected}
        onRetry={queue.retry}
        onBlock={queue.block}
        onUnblock={queue.unblock}
        onRemove={queue.remove}
      />
    </section>
  );
}
