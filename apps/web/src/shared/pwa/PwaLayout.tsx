// apps/web/src/shared/pwa/PwaLayout.tsx

import type { ReactNode } from "react";
import { AuthAwareOfflineSyncBootstrap } from "./AuthAwareOfflineSyncBootstrap";
import { AuthAwareOfflineSyncStatus } from "./AuthAwareOfflineSyncStatus";
import { PwaLocalMigrationBootstrap } from "./PwaLocalMigrationBootstrap";
import { ServiceWorkerUpdateNotice } from "./ServiceWorkerUpdateNotice";
import { PwaStorageRetentionBootstrap } from "./PwaStorageRetentionBootstrap";

type PwaLayoutProps = {
  children: ReactNode;
  showSyncStatus?: boolean;
};

export function PwaLayout({
  children,
  showSyncStatus = true,
}: PwaLayoutProps) {
  return (
    <>
      <PwaStorageRetentionBootstrap />
      <PwaLocalMigrationBootstrap />
      <AuthAwareOfflineSyncBootstrap />
      <ServiceWorkerUpdateNotice />

      {showSyncStatus ? <AuthAwareOfflineSyncStatus /> : null}

      {children}
    </>
  );
}
