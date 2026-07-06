// apps/web/src/shared/pwa/PwaTypedPendingEditor.tsx

import { useEditScopedQueueItem } from "./useEditScopedQueueItem";
import { PwaPendingPayloadEditor } from "./PwaPendingPayloadEditor";
import { PwaClientePendingEditor } from "./editors/PwaClientePendingEditor";
import { PwaFornecedorPendingEditor } from "./editors/PwaFornecedorPendingEditor";
import { PwaServicoPendingEditor } from "./editors/PwaServicoPendingEditor";
import { PwaVendaPendingEditor } from "./editors/PwaVendaPendingEditor";
import { PwaCompraPendingEditor } from "./editors/PwaCompraPendingEditor";
import { PwaOrdemServicoPendingEditor } from "./editors/PwaOrdemServicoPendingEditor";
import { PwaItemTransacaoPendingEditor } from "./editors/PwaItemTransacaoPendingEditor";
import type { PwaQueueItem } from "./pwaSyncTypes";

type Props = {
  item: PwaQueueItem;
  onSaved?: () => void;
  onCancel?: () => void;
};

export function PwaTypedPendingEditor({ item, onSaved, onCancel }: Props) {
  const editor = useEditScopedQueueItem();

  function save(payload: unknown) {
    editor.updatePayload(item.id, payload);
    onSaved?.();
  }

  if (item.type === "clientes.criar") {
    return <PwaClientePendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (item.type === "fornecedores.criar") {
    return <PwaFornecedorPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (item.type === "servicos.criar") {
    return <PwaServicoPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (item.type === "vendas.criar") {
    return <PwaVendaPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (item.type === "compras.criar") {
    return <PwaCompraPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (item.type === "ordensServico.criar") {
    return <PwaOrdemServicoPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  if (
    item.type === "transacoes.itens.adicionar" ||
    item.type === "transacoes.itens.atualizar" ||
    item.type === "transacoes.itens.remover"
  ) {
    return <PwaItemTransacaoPendingEditor item={item} onSave={save} onCancel={onCancel ?? (() => undefined)} />;
  }

  return (
    <PwaPendingPayloadEditor
      item={item}
      onSaved={onSaved}
      onCancel={onCancel}
    />
  );
}
