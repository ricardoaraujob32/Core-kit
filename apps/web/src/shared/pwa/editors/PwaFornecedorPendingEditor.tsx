// apps/web/src/shared/pwa/editors/PwaFornecedorPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import { asRecord, getNullableString, getString, nullableText } from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaFornecedorPendingEditor({ item, onSave, onCancel }: Props) {
  const payload = asRecord(item.payload);

  const [nome, setNome] = useState(getString(payload.nome));
  const [documento, setDocumento] = useState(getNullableString(payload.documento));
  const [email, setEmail] = useState(getNullableString(payload.email));
  const [telefone, setTelefone] = useState(getNullableString(payload.telefone));

  return (
    <section className="ck-register-filter">
      <strong>Corrigir fornecedor pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Nome
          <input value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>

        <label>
          Documento
          <input value={documento} onChange={(event) => setDocumento(event.target.value)} />
        </label>

        <label>
          E-mail
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label>
          Telefone
          <input value={telefone} onChange={(event) => setTelefone(event.target.value)} />
        </label>
      </div>

      <div className="ck-entity-actions-row">
        <button
          className="ck-register-button"
          type="button"
          onClick={() =>
            onSave({
              nome: nome.trim(),
              documento: nullableText(documento),
              email: nullableText(email),
              telefone: nullableText(telefone),
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
