// apps/web/src/shared/pwa/PwaPendingPayloadEditor.tsx

import { useMemo, useState } from "react";
import { useEditScopedQueueItem } from "./useEditScopedQueueItem";
import type { PwaQueueItem } from "./pwaSyncTypes";

type PwaPendingPayloadEditorProps = {
  item: PwaQueueItem;
  onSaved?: () => void;
  onCancel?: () => void;
};

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return "{}";
  }
}

export function PwaPendingPayloadEditor({
  item,
  onSaved,
  onCancel,
}: PwaPendingPayloadEditorProps) {
  const editor = useEditScopedQueueItem();

  const initialValue = useMemo(
    () => stringifyPayload(item.payload),
    [item.payload],
  );

  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  function salvar() {
    setError(null);

    try {
      const parsed = JSON.parse(value);

      editor.updatePayload(item.id, parsed);
      onSaved?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "JSON inválido.",
      );
    }
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Editar pendência</strong>
          <p className="ck-entity-description">
            Corrija o payload local. Ao salvar, a pendência volta para status pendente.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            onClick={salvar}
          >
            Salvar e tentar depois
          </button>

          {onCancel ? (
            <button
              className="ck-register-button"
              type="button"
              onClick={onCancel}
            >
              Cancelar
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="ck-register-alert">{error}</div> : null}

      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={14}
        style={{
          width: "100%",
          fontFamily: "monospace",
          whiteSpace: "pre",
        }}
      />
    </section>
  );
}
