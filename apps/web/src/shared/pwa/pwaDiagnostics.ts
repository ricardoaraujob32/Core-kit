// apps/web/src/shared/pwa/pwaDiagnostics.ts

import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { serializePwaScope, type PwaScope } from "./pwaScope";

export type PwaDiagnosticsSnapshot = {
  generatedAt: string;
  online: boolean;
  serviceWorkerSupported: boolean;
  serviceWorkerController: boolean;
  serviceWorkerRegistrationScope: string | null;
  cacheNames: string[];
  localStorageKeys: string[];
  pwaLocalStorageKeys: string[];
  scopeKey: string;
  queueKey: string;
  queueCount: number;
  idMapKey: string;
  idMapCount: number;
  offlineDetailsKeys: string[];
};

export async function collectPwaDiagnostics(
  scope: PwaScope,
): Promise<PwaDiagnosticsSnapshot> {
  const queue = createScopedOfflineQueue(scope);
  const idMap = createScopedOfflineIdMap(scope);

  const cacheNames =
    "caches" in window ? await caches.keys() : [];

  const registration =
    "serviceWorker" in navigator
      ? await navigator.serviceWorker.getRegistration()
      : null;

  const localStorageKeys =
    typeof localStorage === "undefined"
      ? []
      : Object.keys(localStorage).sort();

  const pwaLocalStorageKeys = localStorageKeys.filter((key) =>
    key.startsWith("corekit:pwa:"),
  );

  const offlineDetailsKeys = pwaLocalStorageKeys.filter((key) =>
    key.startsWith("corekit:pwa:details:"),
  );

  return {
    generatedAt: new Date().toISOString(),
    online: navigator.onLine,
    serviceWorkerSupported: "serviceWorker" in navigator,
    serviceWorkerController: Boolean(navigator.serviceWorker?.controller),
    serviceWorkerRegistrationScope: registration?.scope ?? null,
    cacheNames,
    localStorageKeys,
    pwaLocalStorageKeys,
    scopeKey: serializePwaScope(scope),
    queueKey: queue.key,
    queueCount: queue.list().length,
    idMapKey: idMap.key,
    idMapCount: idMap.list().length,
    offlineDetailsKeys,
  };
}

export function formatPwaDiagnostics(snapshot: PwaDiagnosticsSnapshot): string {
  return JSON.stringify(snapshot, null, 2);
}
