// apps/web/src/shared/pwa/pwaMaintenance.ts

import { offlineStorage } from "./offlineStorage";
import { offlineIdMap } from "./offlineIdMap";
import { offlineQueue } from "./offlineQueue";

export async function clearServiceWorkerCaches() {
  if (!("caches" in window)) return;

  const keys = await caches.keys();

  await Promise.all(
    keys
      .filter((key) => key.startsWith("corekit-"))
      .map((key) => caches.delete(key)),
  );

  const registration = await navigator.serviceWorker?.getRegistration();

  registration?.active?.postMessage({
    type: "CLEAR_PWA_CACHES",
  });
}

export function clearPwaLocalData() {
  offlineStorage.clearCache();
  offlineQueue.clear();
  offlineIdMap.clear();
}

export async function clearAllPwaData() {
  clearPwaLocalData();
  await clearServiceWorkerCaches();
}

export async function getPwaCacheNames(): Promise<string[]> {
  if (!("caches" in window)) return [];

  return caches.keys();
}
