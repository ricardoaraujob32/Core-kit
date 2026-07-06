// apps/web/src/shared/pwa/PwaQueueSanitizerPanel.tsx

import { usePwaQueueSanitizer } from "./usePwaQueueSanitizer";

export function PwaQueueSanitizerPanel() {
  const sanitizer = usePwaQueueSanitizer();

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Saneamento da fila offline</strong>
          <p className="ck-entity-description">
            Valida e normaliza pendências antigas antes da sincronização.
          </p>
        </div>

        <button
          className="ck-register-button"
          type="button"
          onClick={sanitizer.sanitize}
        >
          Sanear fila deste escopo
        </button>
      </div>

      {sanitizer.lastReport ? (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <tbody>
              <tr>
                <th>Verificados</th>
                <td>{sanitizer.lastReport.checked}</td>
              </tr>
              <tr>
                <th>Normalizados</th>
                <td>{sanitizer.lastReport.normalized}</td>
              </tr>
              <tr>
                <th>Bloqueados</th>
                <td>{sanitizer.lastReport.blocked}</td>
              </tr>
              <tr>
                <th>Sem alteração</th>
                <td>{sanitizer.lastReport.unchanged}</td>
              </tr>
            </tbody>
          </table>

          <details>
            <summary>Relatório completo</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {JSON.stringify(sanitizer.lastReport, null, 2)}
            </pre>
          </details>
        </div>
      ) : null}
    </section>
  );
}
