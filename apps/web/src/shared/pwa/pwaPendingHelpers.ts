// apps/web/src/shared/pwa/pwaPendingHelpers.ts

import { isOfflineEntityId } from "./createOfflineEntity";
import type { PwaQueueItem } from "./pwaSyncTypes";

export function isPwaPendingId(id?: string | null): boolean {
  return isOfflineEntityId(id);
}

export function getPwaPendingLabel(id?: string | null): string | null {
  if (!isPwaPendingId(id)) return null;

  if (id?.startsWith("cliente_offline_")) return "Cliente pendente";
  if (id?.startsWith("fornecedor_offline_")) return "Fornecedor pendente";
  if (id?.startsWith("servico_offline_")) return "Serviço pendente";
  if (id?.startsWith("produto_offline_")) return "Produto pendente";
  if (id?.startsWith("transacao_offline_")) return "Transação pendente";
  if (id?.startsWith("ordemServico_offline_")) return "OS pendente";
  if (id?.startsWith("itemTransacao_offline_")) return "Item pendente";

  return "Pendente";
}

export function getPwaQueueStatusLabel(status: PwaQueueItem["status"]): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "syncing":
      return "Sincronizando";
    case "failed":
      return "Falhou";
    case "blocked":
      return "Bloqueado";
    case "synced":
      return "Sincronizado";
    default:
      return status;
  }
}

export function getPwaQueueItemTitle(item: PwaQueueItem): string {
  const payload = item.payload as Record<string, unknown>;

  return String(
    payload.nome ??
      payload.titulo ??
      payload.descricao ??
      payload.observacao ??
      item.localId ??
      item.id,
  );
}
