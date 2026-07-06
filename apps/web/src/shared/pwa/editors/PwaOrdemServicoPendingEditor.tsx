// apps/web/src/shared/pwa/editors/PwaOrdemServicoPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import { asRecord, getNullableString, getString, nullableText } from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaOrdemServicoPendingEditor({
  item,
  onSave,
  onCancel,
}: Props) {
  const payload = asRecord(item.payload);

  const [clienteId, setClienteId] = useState(getNullableString(payload.clienteId));
  const [servicoId, setServicoId] = useState(getNullableString(payload.servicoId));
  const [titulo, setTitulo] = useState(getString(payload.titulo));
  const [descricao, setDescricao] = useState(getNullableString(payload.descricao));

  return (
    <section className="ck-register-filter">
      <strong>Corrigir OS pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Cliente ID
          <input value={clienteId} onChange={(event) => setClienteId(event.target.value)} />
        </label>

        <label>
          Serviço ID
          <input value={servicoId} onChange={(event) => setServicoId(event.target.value)} />
        </label>

        <label>
          Título
          <input value={titulo} onChange={(event) => setTitulo(event.target.value)} />
        </label>

        <label>
          Descrição
          <textarea
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
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
              servicoId: nullableText(servicoId),
              titulo: titulo.trim(),
              descricao: nullableText(descricao),
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
