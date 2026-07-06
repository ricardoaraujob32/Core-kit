// apps/web/src/shared/pwa/PwaIntegrityPanel.tsx

import { usePwaIntegrityCheck } from "./usePwaIntegrityCheck";

export function PwaIntegrityPanel() {
  const integrity = usePwaIntegrityCheck();

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Integridade PWA</strong>
          <p className="ck-entity-description">
            Verifica inconsistências locais na fila, cache, detalhes e service worker.
          </p>
        </div>

        <button
          className="ck-register-button"
          type="button"
          disabled={integrity.isChecking}
          onClick={() => void integrity.check()}
        >
          {integrity.isChecking ? "Verificando..." : "Verificar integridade"}
        </button>
      </div>

      {integrity.report ? (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <tbody>
              <tr>
                <th>Resultado</th>
                <td>{integrity.report.severity}</td>
              </tr>
              <tr>
                <th>OK</th>
                <td>{integrity.report.summary.ok}</td>
              </tr>
              <tr>
                <th>Info</th>
                <td>{integrity.report.summary.info}</td>
              </tr>
              <tr>
                <th>Avisos</th>
                <td>{integrity.report.summary.warning}</td>
              </tr>
              <tr>
                <th>Críticos</th>
                <td>{integrity.report.summary.danger}</td>
              </tr>
            </tbody>
          </table>

          <table className="ck-register-table">
            <thead>
              <tr>
                <th>Severidade</th>
                <th>Origem</th>
                <th>Problema</th>
                <th>Mensagem</th>
              </tr>
            </thead>

            <tbody>
              {integrity.report.issues.map((issue) => (
                <tr key={issue.id}>
                  <td>{issue.severity}</td>
                  <td>{issue.source}</td>
                  <td>{issue.title}</td>
                  <td>{issue.message}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <details>
            <summary>JSON completo</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {JSON.stringify(integrity.report, null, 2)}
            </pre>
          </details>
        </div>
      ) : null}
    </section>
  );
}
