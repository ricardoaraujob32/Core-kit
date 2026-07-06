// apps/web/src/shared/pwa/PwaQueueIssueCard.tsx

import { useState } from "react";
import { PwaPendingPayloadEditor } from "./PwaPendingPayloadEditor";
import { canRetryQueueIssue, canUnblockQueueIssue, formatQueuePayload, getQueueIssueDescription, getQueueIssueSeverity, getQueueIssueTitle
  } from "./pwaQueueIssueHelpers";
import type { PwaQueueItem } from "./pwaSyncTypes";
import { PwaTypedPendingEditor } from "./PwaTypedPendingEditor";

type PwaQueueIssueCardProps = {
  item: PwaQueueItem;
  onRetry: (id: string) => void;
  onUnblock: (id: string) => void;
  onRemove: (id: string) => void;
  onChanged?: () => void;
};

async function copiarPayload(item: PwaQueueItem) {
  await navigator.clipboard.writeText(formatQueuePayload(item));
}

export function PwaQueueIssueCard({
  item,
  onRetry,
  onUnblock,
  onRemove,
  onChanged,
}: PwaQueueIssueCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const severity = getQueueIssueSeverity(item.lastErrorKind);

  return (
    <article className={`ck-register-filter ck-pwa-issue ck-pwa-issue--${severity}`}>
      <div className="ck-register-filter-grid">
        <div>
          <strong>{getQueueIssueTitle(item)}</strong>
          <p className="ck-entity-description">
            {item.type} • {item.status} • tentativa(s): {item.attempts}
          </p>
          <p className="ck-entity-description">
            {getQueueIssueDescription(item)}
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            onClick={() => setIsEditing((current) => !current)}
          >
            {isEditing ? "Fechar edição" : "Editar payload"}
          </button>

          {canRetryQueueIssue(item) ? (
            <button
              className="ck-register-button"
              type="button"
              onClick={() => onRetry(item.id)}
            >
              Tentar novamente
            </button>
          ) : null}

          {canUnblockQueueIssue(item) ? (
            <button
              className="ck-register-button"
              type="button"
              onClick={() => onUnblock(item.id)}
            >
              Desbloquear
            </button>
          ) : null}

          <button
            className="ck-register-button"
            type="button"
            onClick={() => void copiarPayload(item)}
          >
            Copiar payload
          </button>

          <button
            className="ck-register-button"
            type="button"
            onClick={() => onRemove(item.id)}
          >
            Remover
          </button>
        </div>
      </div>

      {item.lastError ? (
        <div className="ck-register-alert">
          {item.lastError}
        </div>
      ) : null}

      {isEditing ? (
        <PwaTypedPendingEditor
          item={item}
          onSaved={() => {
            setIsEditing(false);
            onChanged?.();
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : null}

      <details>
        <summary>Detalhes técnicos</summary>
        <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
          {formatQueuePayload(item)}
        </pre>
      </details>
    </article>
  );
}
