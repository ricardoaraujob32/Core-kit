// apps/web/src/shared/pwa/PwaSupportSnapshotPanel.tsx

import { useState } from "react";
import { stringifyPwaSupportSnapshot } from "./pwaSupportSnapshot";
import { usePwaSupportSnapshot } from "./usePwaSupportSnapshot";

export function PwaSupportSnapshotPanel() {
  const support = usePwaSupportSnapshot();
  const [rawImport, setRawImport] = useState("");
  const [copied, setCopied] = useState(false);

  async function gerar() {
    await support.generate();
    setCopied(false);
  }

  async function copiar() {
    await support.copy();
    setCopied(true);
  }

  function importar() {
    const ok = support.importRaw(rawImport);

    if (ok) {
      setRawImport("");
    }
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Snapshot de suporte PWA</strong>
          <p className="ck-entity-description">
            Exporte fila, logs, diagnóstico e dados locais PWA deste navegador.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <button className="ck-register-button" type="button" onClick={() => void gerar()}>
            Gerar
          </button>

          <button className="ck-register-button" type="button" onClick={() => void copiar()}>
            {copied ? "Copiado" : "Copiar JSON"}
          </button>

          <button className="ck-register-button" type="button" onClick={() => void support.download()}>
            Baixar JSON
          </button>
        </div>
      </div>

      {support.error ? <div className="ck-register-alert">{support.error}</div> : null}

      {support.snapshot ? (
        <div className="ck-register-table-panel">
          <table className="ck-register-table">
            <tbody>
              <tr>
                <th>Exportado em</th>
                <td>{support.snapshot.exportedAt}</td>
              </tr>
              <tr>
                <th>Escopo</th>
                <td>{support.snapshot.scopeKey}</td>
              </tr>
              <tr>
                <th>Fila</th>
                <td>{support.snapshot.queue.length}</td>
              </tr>
              <tr>
                <th>Mapa de IDs</th>
                <td>{support.snapshot.idMap.length}</td>
              </tr>
              <tr>
                <th>Logs</th>
                <td>{support.snapshot.syncLogs.length}</td>
              </tr>
              <tr>
                <th>Chaves locais PWA</th>
                <td>{Object.keys(support.snapshot.pwaLocalStorage).length}</td>
              </tr>
            </tbody>
          </table>

          <details>
            <summary>JSON completo</summary>
            <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
              {stringifyPwaSupportSnapshot(support.snapshot)}
            </pre>
          </details>
        </div>
      ) : null}

      <details>
        <summary>Importar snapshot para diagnóstico</summary>

        <p className="ck-entity-description">
          Use apenas em ambiente de teste/suporte. Isso sobrescreve chaves locais PWA.
        </p>

        <textarea
          value={rawImport}
          rows={8}
          onChange={(event) => setRawImport(event.target.value)}
          style={{
            width: "100%",
            fontFamily: "monospace",
          }}
          placeholder="Cole o JSON do snapshot aqui"
        />

        <button
          className="ck-register-button"
          type="button"
          disabled={!rawImport.trim()}
          onClick={importar}
        >
          Importar snapshot
        </button>
      </details>
    </section>
  );
}
