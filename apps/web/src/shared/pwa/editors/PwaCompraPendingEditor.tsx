// apps/web/src/shared/pwa/editors/PwaCompraPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import { asRecord, getNullableString, nullableText } from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaCompraPendingEditor({ item, onSave, onCancel }: Props) {
  const payload = asRecord(item.payload);

  const [fornecedorId, setFornecedorId] = useState(
    getNullableString(payload.fornecedorId),
  );
  const [observacao, setObservacao] = useState(getNullableString(payload.observacao));

  return (
    <section className="ck-register-filter">
      <strong>Corrigir compra pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Fornecedor ID
          <input
            value={fornecedorId}
            onChange={(event) => setFornecedorId(event.target.value)}
          />
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
              fornecedorId: nullableText(fornecedorId),
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
