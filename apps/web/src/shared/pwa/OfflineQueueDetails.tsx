// apps/web/src/shared/pwa/OfflineQueueDetails.tsx

import type { PwaQueueItem } from "./pwaSyncTypes";

type OfflineQueueDetailsProps = {
  item: PwaQueueItem | null;
  onClose: () => void;
};

function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function OfflineQueueDetails({
  item,
  onClose,
}: OfflineQueueDetailsProps) {
  if (!item) return null;

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Detalhes da pendência</strong>
          <p className="ck-entity-description">
            {item.type} • {item.status}
            {item.lastErrorKind ? ` • ${item.lastErrorKind}` : ""}
          </p>
        </div>

        <button
          className="ck-register-button"
          type="button"
          onClick={onClose}
        >
          Fechar detalhes
        </button>
      </div>

      {item.lastError ? (
        <div className="ck-register-alert">
          {item.lastError}
        </div>
      ) : null}

      <pre
        style={{
          whiteSpace: "pre-wrap",
          overflowX: "auto",
        }}
      >
        {formatJson({
          id: item.id,
          localId: item.localId,
          type: item.type,
          status: item.status,
          attempts: item.attempts,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          payload: item.payload,
          lastError: item.lastError,
          lastErrorKind: item.lastErrorKind,
          lastErrorDetails: item.lastErrorDetails,
        })}
      </pre>
    </section>
  );
}
