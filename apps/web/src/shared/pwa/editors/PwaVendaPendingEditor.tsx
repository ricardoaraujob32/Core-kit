// apps/web/src/shared/pwa/editors/PwaVendaPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import { asRecord, getNullableString, nullableText } from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaVendaPendingEditor({ item, onSave, onCancel }: Props) {
  const payload = asRecord(item.payload);

  const [clienteId, setClienteId] = useState(getNullableString(payload.clienteId));
  const [observacao, setObservacao] = useState(getNullableString(payload.observacao));

  return (
    <section className="ck-register-filter">
      <strong>Corrigir venda pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Cliente ID
          <input value={clienteId} onChange={(event) => setClienteId(event.target.value)} />
        </label>

        <label>
          Observação
          <textarea
            value={observacao}
            onChange={(event) => setObservacao(event.target.value)}
          />
        </label>
      </div>

      <div className="ck-entity-actions-row">
        <button
          className="ck-register-button"
          type="button"
          onClick={() =>
            onSave({
              clienteId: nullableText(clienteId),
              observacao: nullableText(observacao),
            })
          }
        >
          Salvar correção
        </button>

        <button className="ck-register-button" type="button" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </section>
  );
}
