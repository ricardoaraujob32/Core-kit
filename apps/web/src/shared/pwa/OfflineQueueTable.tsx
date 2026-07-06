// apps/web/src/shared/pwa/OfflineQueueTable.tsx

import type { PwaQueueItem } from "./pwaSyncTypes";

type OfflineQueueTableProps = {
  items: PwaQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  onDetails: (item: PwaQueueItem) => void;
  onRetry: (id: string) => void;
  onBlock: (id: string) => void;
  onUnblock: (id: string) => void;
  onRemove: (id: string) => void;
};

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function payloadResumo(item: PwaQueueItem): string {
  const payload = item.payload as Record<string, unknown>;

  const candidates = [
    payload?.nome,
    payload?.titulo,
    payload?.observacao,
    payload?.descricao,
    payload?.clienteId,
    payload?.fornecedorId,
    payload?.produtoId,
  ].filter(Boolean);

  return candidates.length > 0 ? String(candidates[0]) : "Sem resumo";
}

export function OfflineQueueTable({
  items,
  isOnline,
  isSyncing,
  onDetails,
  onRetry,
  onBlock,
  onUnblock,
  onRemove,
}: OfflineQueueTableProps) {
  if (items.length === 0) {
    return (
      <p className="ck-entity-description">
        Nenhuma pendência offline no momento.
      </p>
    );
  }

  return (
    <div className="ck-register-table-panel">
      <table className="ck-register-table">
        <thead>
          <tr>
            <th>Operação</th>
            <th>Resumo</th>
            <th>Status</th>
            <th>Erro</th>
            <th>Tentativas</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.type}</td>
              <td>{payloadResumo(item)}</td>
              <td>{item.status}</td>
              <td>{item.lastErrorKind ?? "—"}</td>
              <td>{item.attempts}</td>
              <td>{formatDate(item.createdAt)}</td>
              <td>
                <div className="ck-entity-actions-row">
                  <button
                    className="ck-register-button"
                    type="button"
                    onClick={() => onDetails(item)}
                  >
                    Detalhes
                  </button>

                  {item.status === "failed" || item.status === "blocked" ? (
                    <button
                      className="ck-register-button"
                      type="button"
                      disabled={!isOnline || isSyncing}
                      onClick={() => onRetry(item.id)}
                    >
                      Tentar novamente
                    </button>
                  ) : null}

                  {item.status !== "blocked" ? (
                    <button
                      className="ck-register-button"
                      type="button"
                      disabled={item.status === "syncing"}
                      onClick={() => onBlock(item.id)}
                    >
                      Bloquear
                    </button>
                  ) : (
                    <button
                      className="ck-register-button"
                      type="button"
                      onClick={() => onUnblock(item.id)}
                    >
                      Desbloquear
                    </button>
                  )}

                  <button
                    className="ck-register-button"
                    type="button"
                    disabled={item.status === "syncing"}
                    onClick={() => onRemove(item.id)}
                  >
                    Remover
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
