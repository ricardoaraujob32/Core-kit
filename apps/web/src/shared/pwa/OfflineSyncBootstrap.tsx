// apps/web/src/shared/pwa/OfflineSyncBootstrap.tsx

import { offlineCreateProcessor } from "./offlineCreateProcessor";
import { useOfflineMutationQueue } from "./useOfflineMutationQueue";

/**
 * Componente sem UI para ativar sincronização automática da fila
 * quando o navegador voltar a ficar online.
 *
 * Coloque uma vez dentro do layout autenticado.
 */
export function OfflineSyncBootstrap() {
  useOfflineMutationQueue(offlineCreateProcessor);

  return null;
}
