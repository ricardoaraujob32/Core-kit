// apps/web/src/shared/pwa/editors/PwaServicoPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import {
  asRecord,
  getNullableString,
  getNumber,
  getString,
  nullableText,
  numberOrNull,
} from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaServicoPendingEditor({ item, onSave, onCancel }: Props) {
  const payload = asRecord(item.payload);

  const [nome, setNome] = useState(getString(payload.nome));
  const [sku, setSku] = useState(getNullableString(payload.sku));
  const [descricao, setDescricao] = useState(getNullableString(payload.descricao));
  const [unidade, setUnidade] = useState(getString(payload.unidade) || "UN");
  const [precoVenda, setPrecoVenda] = useState(String(getNumber(payload.precoVenda)));
  const [custoReferencia, setCustoReferencia] = useState(
    payload.custoReferencia === null || payload.custoReferencia === undefined
      ? ""
      : String(getNumber(payload.custoReferencia)),
  );

  return (
    <section className="ck-register-filter">
      <strong>Corrigir serviço pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Nome
          <input value={nome} onChange={(event) => setNome(event.target.value)} />
        </label>

        <label>
          Código/SKU
          <input value={sku} onChange={(event) => setSku(event.target.value)} />
        </label>

        <label>
          Unidade
          <input value={unidade} onChange={(event) => setUnidade(event.target.value)} />
        </label>

        <label>
          Preço de venda
          <input
            type="number"
            step="0.01"
            value={precoVenda}
            onChange={(event) => setPrecoVenda(event.target.value)}
          />
        </label>

        <label>
          Custo referência
          <input
            type="number"
            step="0.01"
            value={custoReferencia}
            onChange={(event) => setCustoReferencia(event.target.value)}
          />
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
              nome: nome.trim(),
              sku: nullableText(sku),
              descricao: nullableText(descricao),
              unidade: unidade.trim() || "UN",
              tipo: "SERVICO",
              precoVenda: Number(precoVenda) || 0,
              custoReferencia: numberOrNull(custoReferencia),
              ativo: true,
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
