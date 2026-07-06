// apps/web/src/shared/pwa/PwaPendingPanel.tsx

import { getPwaQueueItemTitle } from "./pwaPendingHelpers";
import { PwaSyncBadge } from "./PwaSyncBadge";
import { usePendingQueueItems } from "./usePendingQueueItems";

type PwaPendingPanelProps = {
  title?: string;
  types?: string[];
  localId?: string | null;
};

export function PwaPendingPanel({
  title = "Pendências desta tela",
  types,
  localId,
}: PwaPendingPanelProps) {
  const queue = usePendingQueueItems({ types, localId });

  if (queue.count === 0) return null;

  return (
    <section className="ck-register-filter">
      <strong>{title}</strong>

      <div className="ck-register-table-panel">
        <table className="ck-register-table">
          <thead>
            <tr>
              <th>Operação</th>
              <th>Registro</th>
              <th>Status</th>
              <th>Erro</th>
            </tr>
          </thead>

          <tbody>
            {queue.items.map((item) => (
              <tr key={item.id}>
                <td>{item.type}</td>
                <td>{getPwaQueueItemTitle(item)}</td>
                <td>
                  <PwaSyncBadge status={item.status} />
                </td>
                <td>{item.lastError ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
