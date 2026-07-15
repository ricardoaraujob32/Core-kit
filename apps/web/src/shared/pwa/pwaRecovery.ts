// apps/web/src/shared/pwa/pwaRecovery.ts

import { runPwaRetentionPolicy } from "./pwaRetentionPolicy";
import { sanitizeScopedOfflineQueue } from "./pwaQueueSanitizer";
import { backupPwaLocalStorage } from "./pwaLocalSchema";
import { createPwaSyncLogStore } from "./pwaSyncLogStore";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { buildPwaCacheKey, type PwaScope } from "./pwaScope";

export type PwaRecoveryAction =
  | "reload"
  | "clearBrowserCaches"
  | "sanitizeQueue"
  | "applyRetention"
  | "clearLogs"
  | "clearOrphanDetails"
  | "clearQueue"
  | "fullReset";

export type PwaRecoveryResult = {
  action: PwaRecoveryAction;
  executedAt: string;
  backupKey: string | null;
  messages: string[];
};

function result(params: {
  action: PwaRecoveryAction;
  backupKey: string | null;
  messages: string[];
}): PwaRecoveryResult {
  return {
    action: params.action,
    executedAt: new Date().toISOString(),
    backupKey: params.backupKey,
    messages: params.messages,
  };
}

async function clearBrowserCaches(): Promise<string[]> {
  if (!("caches" in window)) {
    return ["Cache Storage não disponível neste navegador."];
  }

  const keys = await caches.keys();
  const pwaKeys = keys.filter((key) => key.startsWith("corekit-"));

  await Promise.all(pwaKeys.map((key) => caches.delete(key)));

  return [`${pwaKeys.length} cache(s) do navegador removido(s).`];
}

function clearOrphanDetails(scope: PwaScope): string[] {
  if (typeof localStorage === "undefined") return ["localStorage indisponível."];

  const scopePrefix = buildPwaCacheKey(scope, "");
  const detailsPrefix = `corekit:pwa:details:${scopePrefix}`;
  const queue = createScopedOfflineQueue(scope);
  const localIds = queue
    .list()
    .map((item) => item.localId)
    .filter((id): id is string => Boolean(id));

  let removed = 0;

  for (const key of Object.keys(localStorage)) {
    if (!key.startsWith(detailsPrefix)) continue;

    const hasQueue = localIds.some((localId) => key.includes(localId));

    if (!hasQueue) {
      localStorage.removeItem(key);
      removed += 1;
    }
  }

  return [`${removed} detalhe(s) offline órfão(s) removido(s).`];
}

function clearAllPwaLocalStorage(): string[] {
  if (typeof localStorage === "undefined") return ["localStorage indisponível."];

  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith("corekit:pwa:"),
  );

  for (const key of keys) {
    localStorage.removeItem(key);
  }

  return [`${keys.length} chave(s) PWA removida(s).`];
}

export async function runPwaRecoveryAction(params: {
  scope: PwaScope;
  action: PwaRecoveryAction;
}): Promise<PwaRecoveryResult> {
  const { scope, action } = params;
  const destructiveActions: PwaRecoveryAction[] = [
    "clearLogs",
    "clearOrphanDetails",
    "clearQueue",
    "fullReset",
    "clearBrowserCaches",
  ];

  const backupKey = destructiveActions.includes(action)
    ? backupPwaLocalStorage(`recovery-${action}`)
    : null;

  if (action === "reload") {
    window.location.reload();
    return result({
      action,
      backupKey,
      messages: ["Recarregamento solicitado."],
    });
  }

  if (action === "clearBrowserCaches") {
    return result({
      action,
      backupKey,
      messages: await clearBrowserCaches(),
    });
  }

  if (action === "sanitizeQueue") {
    const report = sanitizeScopedOfflineQueue(scope);

    return result({
      action,
      backupKey,
      messages: [
        `${report.normalized} normalizado(s).`,
        `${report.blocked} bloqueado(s).`,
        `${report.unchanged} sem alteração.`,
      ],
    });
  }

  if (action === "applyRetention") {
    const retention = runPwaRetentionPolicy();

    return result({
      action,
      backupKey,
      messages: retention.messages,
    });
  }

  if (action === "clearLogs") {
    createPwaSyncLogStore(scope).clear();

    return result({
      action,
      backupKey,
      messages: ["Histórico de sincronização limpo."],
    });
  }

  if (action === "clearOrphanDetails") {
    return result({
      action,
      backupKey,
      messages: clearOrphanDetails(scope),
    });
  }

  if (action === "clearQueue") {
    createScopedOfflineQueue(scope).clear();

    return result({
      action,
      backupKey,
      messages: ["Fila offline deste escopo limpa."],
    });
  }

  if (action === "fullReset") {
    const cacheMessages = await clearBrowserCaches();
    const storageMessages = clearAllPwaLocalStorage();

    return result({
      action,
      backupKey,
      messages: [...cacheMessages, ...storageMessages],
    });
  }

  return result({
    action,
    backupKey,
    messages: ["Ação não reconhecida."],
  });
}
