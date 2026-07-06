// apps/web/src/shared/pwa/editors/PwaItemTransacaoPendingEditor.tsx

import { useState } from "react";
import type { PwaQueueItem } from "../pwaSyncTypes";
import {
  asRecord,
  getNullableString,
  getNumber,
  nullableText,
} from "./editorUtils";

type Props = {
  item: PwaQueueItem;
  onSave: (payload: unknown) => void;
  onCancel: () => void;
};

export function PwaItemTransacaoPendingEditor({
  item,
  onSave,
  onCancel,
}: Props) {
  const payload = asRecord(item.payload);

  const [transacaoId, setTransacaoId] = useState(
    getNullableString(payload.transacaoId),
  );
  const [produtoId, setProdutoId] = useState(getNullableString(payload.produtoId));
  const [quantidade, setQuantidade] = useState(String(getNumber(payload.quantidade) || 1));
  const [valorUnitario, setValorUnitario] = useState(String(getNumber(payload.valorUnitario)));
  const [valorDesconto, setValorDesconto] = useState(String(getNumber(payload.valorDesconto)));
  const [descricao, setDescricao] = useState(getNullableString(payload.descricao));

  return (
    <section className="ck-register-filter">
      <strong>Corrigir item pendente</strong>

      <div className="ck-register-filter-grid">
        <label>
          Transação ID
          <input value={transacaoId} onChange={(event) => setTransacaoId(event.target.value)} />
        </label>

        <label>
          Produto/Serviço ID
          <input value={produtoId} onChange={(event) => setProdutoId(event.target.value)} />
        </label>

        <label>
          Quantidade
          <input
            type="number"
            step="0.001"
            value={quantidade}
            onChange={(event) => setQuantidade(event.target.value)}
          />
        </label>

        <label>
          Valor unitário
          <input
            type="number"
            step="0.01"
            value={valorUnitario}
            onChange={(event) => setValorUnitario(event.target.value)}
          />
        </label>

        <label>
          Valor desconto
          <input
            type="number"
            step="0.01"
            value={valorDesconto}
            onChange={(event) => setValorDesconto(event.target.value)}
          />
        </label>

        <label>
          Descrição
          <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} />
        </label>
      </div>

      <div className="ck-entity-actions-row">
        <button
          className="ck-register-button"
          type="button"
          onClick={() =>
            onSave({
              transacaoId: transacaoId.trim(),
              produtoId: produtoId.trim(),
              quantidade: Number(quantidade) || 1,
              valorUnitario: Number(valorUnitario) || 0,
              valorDesconto: Number(valorDesconto) || 0,
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
