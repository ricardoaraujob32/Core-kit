// apps/web/src/shared/pwa/PwaLocalMigrationPanel.tsx

import { usePwaLocalMigration } from "./usePwaLocalMigration";

export function PwaLocalMigrationPanel() {
  const migration = usePwaLocalMigration();

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Schema local PWA</strong>
          <p className="ck-entity-description">
            Controle de versão dos dados locais offline.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button
            className="ck-register-button"
            type="button"
            onClick={migration.refresh}
          >
            Atualizar
          </button>

          <button
            className="ck-register-button"
            type="button"
            disabled={!migration.status.needsMigration}
            onClick={migration.migrate}
          >
            Migrar agora
          </button>
        </div>
      </div>

      <dl className="ck-entity-detail-list">
        <div>
          <dt>Versão atual</dt>
          <dd>{migration.status.currentVersion}</dd>
        </div>

        <div>
          <dt>Versão alvo</dt>
          <dd>{migration.status.targetVersion}</dd>
        </div>

        <div>
          <dt>Precisa migrar</dt>
          <dd>{migration.status.needsMigration ? "Sim" : "Não"}</dd>
        </div>
      </dl>

      {migration.lastResult ? (
        <details>
          <summary>Última migração</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(migration.lastResult, null, 2)}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
