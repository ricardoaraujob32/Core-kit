// apps/web/src/shared/pwa/ScopedOfflineSyncBootstrap.tsx

import { useScopedOfflineMutationQueue } from "./useScopedOfflineMutationQueue";

/**
 * Bootstrap de sincronização com escopo de usuário/locatário.
 */
export function ScopedOfflineSyncBootstrap() {
  useScopedOfflineMutationQueue();

  return null;
}
