// apps/web/src/shared/pwa/PwaDiagnosticsPanel.tsx

import { useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import {
  collectPwaDiagnostics,
  formatPwaDiagnostics,
  type PwaDiagnosticsSnapshot,
} from "./pwaDiagnostics";

export function PwaDiagnosticsPanel() {
  const { scope, scopeKey } = usePwaScope();
  const [snapshot, setSnapshot] = useState<PwaDiagnosticsSnapshot | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function gerarDiagnostico() {
    setIsLoading(true);
    setCopied(false);

    try {
      setSnapshot(await collectPwaDiagnostics(scope));
    } finally {
      setIsLoading(false);
    }
  }

  async function copiarDiagnostico() {
    if (!snapshot) return;

    await navigator.clipboard.writeText(formatPwaDiagnostics(snapshot));
    setCopied(true);
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Diagnóstico PWA</strong>
          <p className="ck-entity-description">
            Verifique service worker, caches, fila offline e escopo atual.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            disabled={isLoading}
            onClick={() => void gerarDiagnostico()}
          >
            {isLoading ? "Gerando..." : "Gerar diagnóstico"}
          </button>

          <button
            className="ck-register-button"
            type="button"
            disabled={!snapshot}
            onClick={() => void copiarDiagnostico()}
          >
            {copied ? "Copiado" : "Copiar JSON"}
          </button>
        </div>
      </div>

      <dl className="ck-entity-detail-list">
        <div>
          <dt>Escopo atual</dt>
          <dd>{scopeKey}</dd>
        </div>

        <div>
          <dt>Status de conexão</dt>
          <dd>{typeof navigator !== "undefined" && navigator.onLine ? "Online" : "Offline"}</dd>
        </div>
      </dl>

      {snapshot ? (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <tbody>
              <tr>
                <th>Gerado em</th>
                <td>{snapshot.generatedAt}</td>
              </tr>
              <tr>
                <th>Service Worker suportado</th>
                <td>{snapshot.serviceWorkerSupported ? "Sim" : "Não"}</td>
              </tr>
              <tr>
                <th>Service Worker controlando página</th>
                <td>{snapshot.serviceWorkerController ? "Sim" : "Não"}</td>
              </tr>
              <tr>
                <th>Escopo do Service Worker</th>
                <td>{snapshot.serviceWorkerRegistrationScope ?? "—"}</td>
              </tr>
              <tr>
                <th>Caches</th>
                <td>{snapshot.cacheNames.length}</td>
              </tr>
              <tr>
                <th>Chaves PWA no localStorage</th>
                <td>{snapshot.pwaLocalStorageKeys.length}</td>
              </tr>
              <tr>
                <th>Fila offline deste escopo</th>
                <td>{snapshot.queueCount}</td>
              </tr>
              <tr>
                <th>Mapa de IDs deste escopo</th>
                <td>{snapshot.idMapCount}</td>
              </tr>
              <tr>
                <th>Detalhes offline</th>
                <td>{snapshot.offlineDetailsKeys.length}</td>
              </tr>
            </tbody>
          </table>

          <details>
            <summary>JSON completo</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {formatPwaDiagnostics(snapshot)}
            </pre>
          </details>
        </div>
      ) : null}
    </section>
  );
}
