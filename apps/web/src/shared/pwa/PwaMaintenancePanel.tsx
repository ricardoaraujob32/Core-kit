// apps/web/src/shared/pwa/PwaMaintenancePanel.tsx

import { useEffect, useState } from "react";
import {
  clearAllPwaData,
  clearPwaLocalData,
  clearServiceWorkerCaches,
  getPwaCacheNames,
} from "./pwaMaintenance";

export function PwaMaintenancePanel() {
  const [cacheNames, setCacheNames] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshCaches() {
    setCacheNames(await getPwaCacheNames());
  }

  useEffect(() => {
    void refreshCaches();
  }, []);

  async function handleClearCaches() {
    await clearServiceWorkerCaches();
    await refreshCaches();
    setMessage("Caches do Service Worker limpos.");
  }

  function handleClearLocalData() {
    clearPwaLocalData();
    setMessage("Dados locais PWA limpos.");
  }

  async function handleClearAll() {
    await clearAllPwaData();
    await refreshCaches();
    setMessage("Todos os dados PWA foram limpos.");
  }

  return (
    <section className="ck-register-filter">
      <div className="ck-register-filter-grid">
        <div>
          <strong>Manutenção PWA</strong>
          <p className="ck-entity-description">
            Use estas ações apenas para diagnóstico, suporte ou limpeza de estado local.
          </p>
        </div>
      </div>

      {message ? <div className="ck-register-alert">{message}</div> : null}

      <div className="ck-entity-actions-row">
        <button
          className="ck-register-button"
          type="button"
          onClick={() => void handleClearCaches()}
        >
          Limpar caches do app
        </button>

        <button
          className="ck-register-button"
          type="button"
          onClick={handleClearLocalData}
        >
          Limpar dados locais PWA
        </button>

        <button
          className="ck-register-button"
          type="button"
          onClick={() => void handleClearAll()}
        >
          Limpar tudo
        </button>

        <button
          className="ck-register-button"
          type="button"
          onClick={() => void refreshCaches()}
        >
          Atualizar lista
        </button>
      </div>

      <div className="ck-register-table-panel">
        <table className="ck-register-table">
          <thead>
            <tr>
              <th>Caches ativos</th>
            </tr>
          </thead>

          <tbody>
            {cacheNames.length === 0 ? (
              <tr>
                <td>Nenhum cache encontrado.</td>
              </tr>
            ) : (
              cacheNames.map((name) => (
                <tr key={name}>
                  <td>{name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
