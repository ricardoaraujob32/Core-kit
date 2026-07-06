// apps/web/src/shared/pwa/PwaSyncLogPanel.tsx

import { useState } from "react";
import { usePwaSyncLog } from "./usePwaSyncLog";

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "medium",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function PwaSyncLogPanel() {
  const log = usePwaSyncLog();
  const [copied, setCopied] = useState(false);

  async function copiar() {
    await log.copyJson();
    setCopied(true);
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Histórico de sincronização</strong>
          <p className="ck-entity-description">
            Registros locais de sucesso, falhas, saneamento e ações manuais.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            onClick={log.refresh}
          >
            Atualizar
          </button>

          <button
            className="ck-register-button"
            type="button"
            disabled={log.entries.length === 0}
            onClick={() => void copiar()}
          >
            {copied ? "Copiado" : "Copiar JSON"}
          </button>

          <button
            className="ck-register-button"
            type="button"
            disabled={log.entries.length === 0}
            onClick={log.clear}
          >
            Limpar histórico
          </button>
        </div>
      </div>

      {log.entries.length === 0 ? (
        <p className="ck-entity-description">
          Ainda não há registros de sincronização.
        </p>
      ) : (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nível</th>
                <th>Evento</th>
                <th>Mensagem</th>
                <th>Erro</th>
              </tr>
            </thead>

            <tbody>
              {log.entries.slice(0, 80).map((entry) => (
                <tr key={entry.id}>
                  <td>{formatDate(entry.createdAt)}</td>
                  <td>{entry.level}</td>
                  <td>{entry.event}</td>
                  <td>{entry.message}</td>
                  <td>{entry.errorKind ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <details>
            <summary>JSON completo</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {log.exportJson()}
            </pre>
          </details>
        </div>
      )}
    </section>
  );
}
