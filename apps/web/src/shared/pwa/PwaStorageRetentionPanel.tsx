// apps/web/src/shared/pwa/PwaStorageRetentionPanel.tsx

import { formatBytes } from "./pwaStorageUsage";
import { usePwaStorageRetention } from "./usePwaStorageRetention";

export function PwaStorageRetentionPanel() {
  const retention = usePwaStorageRetention();

  const categories = Object.entries(retention.usage.byCategory).filter(
    ([, bytes]) => bytes > 0,
  );

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Armazenamento PWA</strong>
          <p className="ck-entity-description">
            Controle de espaço usado por fila, logs, cache, backups e detalhes offline.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            onClick={retention.refresh}
          >
            Atualizar
          </button>

          <button
            className="ck-register-button"
            type="button"
            onClick={retention.cleanup}
          >
            Aplicar retenção
          </button>
        </div>
      </div>

      <dl className="ck-entity-detail-list">
        <div>
          <dt>Total</dt>
          <dd>{formatBytes(retention.usage.totalBytes)}</dd>
        </div>

        <div>
          <dt>Chaves PWA</dt>
          <dd>{retention.usage.entries.length}</dd>
        </div>

        <div>
          <dt>Atualizado em</dt>
          <dd>{retention.usage.generatedAt}</dd>
        </div>
      </dl>

      {categories.length > 0 ? (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <thead>
              <tr>
                <th>Categoria</th>
                <th>Uso</th>
              </tr>
            </thead>

            <tbody>
              {categories.map(([category, bytes]) => (
                <tr key={category}>
                  <td>{category}</td>
                  <td>{formatBytes(bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {retention.lastCleanup ? (
        <details>
          <summary>Última limpeza</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(retention.lastCleanup, null, 2)}
          </pre>
        </details>
      ) : null}

      <details>
        <summary>Maiores chaves</summary>
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <thead>
              <tr>
                <th>Chave</th>
                <th>Categoria</th>
                <th>Tamanho</th>
              </tr>
            </thead>

            <tbody>
              {retention.usage.entries.slice(0, 20).map((entry) => (
                <tr key={entry.key}>
                  <td>{entry.key}</td>
                  <td>{entry.category}</td>
                  <td>{formatBytes(entry.bytes)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
