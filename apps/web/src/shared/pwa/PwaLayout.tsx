// apps/web/src/shared/pwa/PwaLayout.tsx

import type { ReactNode } from "react";
import { AuthAwareOfflineSyncBootstrap } from "./AuthAwareOfflineSyncBootstrap";
import { AuthAwareOfflineSyncStatus } from "./AuthAwareOfflineSyncStatus";
import { ServiceWorkerUpdateNotice } from "./ServiceWorkerUpdateNotice";

type PwaLayoutProps = {
  children: ReactNode;
  showSyncStatus?: boolean;
};

/**
 * Camada global PWA com:
 * - Service Worker update notice;
 * - fila offline escopada;
 * - sincronização consciente de autenticação.
 */
export function PwaLayout({
  children,
  showSyncStatus = true,
}: PwaLayoutProps) {
  return (
    <>
      <AuthAwareOfflineSyncBootstrap />
      <ServiceWorkerUpdateNotice />

      {showSyncStatus ? <AuthAwareOfflineSyncStatus /> : null}

      {children}
    </>
  );
}
