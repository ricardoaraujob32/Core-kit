// apps/web/src/shared/pwa/PwaRecoveryPanel.tsx

import { useState } from "react";
import { usePwaRecovery } from "./usePwaRecovery";
import type { PwaRecoveryAction } from "./pwaRecovery";

const ACTIONS: Array<{
  action: PwaRecoveryAction;
  label: string;
  description: string;
  destructive?: boolean;
}> = [
  {
    action: "reload",
    label: "Recarregar app",
    description: "Recarrega a página atual.",
  },
  {
    action: "clearBrowserCaches",
    label: "Limpar caches do navegador",
    description: "Remove caches corekit-* do Cache Storage.",
    destructive: true,
  },
  {
    action: "sanitizeQueue",
    label: "Sanear fila",
    description: "Normaliza payloads válidos e bloqueia inválidos.",
  },
  {
    action: "applyRetention",
    label: "Aplicar retenção",
    description: "Remove backups/caches/logs antigos conforme política.",
  },
  {
    action: "clearLogs",
    label: "Limpar logs",
    description: "Remove histórico local de sincronização.",
    destructive: true,
  },
  {
    action: "clearOrphanDetails",
    label: "Limpar detalhes órfãos",
    description: "Remove detalhes offline sem item correspondente na fila.",
    destructive: true,
  },
  {
    action: "clearQueue",
    label: "Limpar fila offline",
    description: "Remove pendências offline do escopo atual.",
    destructive: true,
  },
  {
    action: "fullReset",
    label: "Reset PWA total",
    description: "Remove caches do navegador e todas as chaves corekit:pwa:*.",
    destructive: true,
  },
];

export function PwaRecoveryPanel() {
  const recovery = usePwaRecovery();
  const [confirmAction, setConfirmAction] = useState<PwaRecoveryAction | null>(
    null,
  );

  async function executar(action: PwaRecoveryAction, destructive?: boolean) {
    if (destructive && confirmAction !== action) {
      setConfirmAction(action);
      return;
    }

    await recovery.run(action);
    setConfirmAction(null);
  }

  return (
    <section className="ck-register-filter">
      <div>
        <strong>Recuperação PWA</strong>
        <p className="ck-entity-description">
          Ações graduais para corrigir problemas locais sem apagar tudo de primeira.
        </p>
      </div>

      <div className="ck-register-table-panel">
        <table className="ck-register-table">
          <thead>
            <tr>
              <th>Ação</th>
              <th>Descrição</th>
              <th>Executar</th>
            </tr>
          </thead>

          <tbody>
            {ACTIONS.map((item) => (
              <tr key={item.action}>
                <td>{item.label}</td>
                <td>{item.description}</td>
                <td>
                  <button
                    className="ck-register-button"
                    type="button"
                    disabled={recovery.isRunning}
                    onClick={() => void executar(item.action, item.destructive)}
                  >
                    {confirmAction === item.action
                      ? "Confirmar"
                      : item.destructive
                        ? "Executar..."
                        : "Executar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {recovery.lastResult ? (
        <details open>
          <summary>Resultado da última recuperação</summary>
          <pre style={{ whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {JSON.stringify(recovery.lastResult, null, 2)}
          </pre>
        </details>
      ) : null}
    </section>
  );
}
