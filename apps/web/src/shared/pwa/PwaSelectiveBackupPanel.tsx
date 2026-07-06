// apps/web/src/shared/pwa/PwaSelectiveBackupPanel.tsx

import { useState } from "react";
import {
  stringifyPwaSelectiveBackup,
  type PwaSelectiveBackupKind,
} from "./pwaSelectiveBackup";
import { usePwaSelectiveBackup } from "./usePwaSelectiveBackup";

const KINDS: Array<{
  kind: PwaSelectiveBackupKind;
  label: string;
}> = [
  { kind: "queue", label: "Fila offline" },
  { kind: "idMap", label: "Mapa de IDs" },
  { kind: "syncLogs", label: "Logs de sincronização" },
  { kind: "offlineDetails", label: "Detalhes offline" },
];

export function PwaSelectiveBackupPanel() {
  const backup = usePwaSelectiveBackup();

  const [kind, setKind] = useState<PwaSelectiveBackupKind>("queue");
  const [rawImport, setRawImport] = useState("");
  const [restoreMode, setRestoreMode] = useState<"replace" | "merge">("merge");
  const [copied, setCopied] = useState(false);

  function gerar() {
    backup.create(kind);
    setCopied(false);
  }

  async function copiar() {
    await backup.copy();
    setCopied(true);
  }

  function restaurar() {
    const ok = backup.restoreRaw(rawImport, restoreMode);

    if (ok) {
      setRawImport("");
    }
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Backup seletivo PWA</strong>
          <p className="ck-entity-description">
            Exporte, restaure ou limpe categorias locais específicas.
          </p>
        </div>

        <div className="ck-entity-actions-row">
          <select
            value={kind}
            onChange={(event) =>
              setKind(event.target.value as PwaSelectiveBackupKind)
            }
          >
            {KINDS.map((item) => (
              <option key={item.kind} value={item.kind}>
                {item.label}
              </option>
            ))}
          </select>

          <button className="ck-register-button" type="button" onClick={gerar}>
            Gerar
          </button>

          <button
            className="ck-register-button"
            type="button"
            disabled={!backup.backup}
            onClick={() => void copiar()}
          >
            {copied ? "Copiado" : "Copiar"}
          </button>

          <button
            className="ck-register-button"
            type="button"
            onClick={() => backup.clear(kind)}
          >
            Limpar categoria
          </button>
        </div>
      </div>

      {backup.error ? <div className="ck-register-alert">{backup.error}</div> : null}

      {backup.backup ? (
        <details open>
          <summary>Backup gerado</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {stringifyPwaSelectiveBackup(backup.backup)}
          </pre>
        </details>
      ) : null}

      <details>
        <summary>Restaurar backup seletivo</summary>

        <div className="ck-entity-actions-row">
          <label>
            Modo
            <select
              value={restoreMode}
              onChange={(event) =>
                setRestoreMode(event.target.value as "replace" | "merge")
              }
            >
              <option value="merge">Mesclar</option>
              <option value="replace">Substituir categoria</option>
            </select>
          </label>
        </div>

        <textarea
          value={rawImport}
          rows={8}
          onChange={(event) => setRawImport(event.target.value)}
          style={{
            width: "100%",
            fontFamily: "monospace",
          }}
          placeholder="Cole o backup seletivo aqui"
        />

        <button
          className="ck-register-button"
          type="button"
          disabled={!rawImport.trim()}
          onClick={restaurar}
        >
          Restaurar
        </button>
      </details>
    </section>
  );
}
