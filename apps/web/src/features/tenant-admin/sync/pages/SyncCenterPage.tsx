// apps/web/src/features/tenant-admin/sync/pages/SyncCenterPage.tsx

import { PwaConflictResolutionPanel } from "../../../../shared/pwa/PwaConflictResolutionPanel";
import { PwaDiagnosticsPanel } from "../../../../shared/pwa/PwaDiagnosticsPanel";
import { PwaIntegrityPanel } from "../../../../shared/pwa/PwaIntegrityPanel";
import { PwaLocalMigrationPanel } from "../../../../shared/pwa/PwaLocalMigrationPanel";
import { PwaMaintenancePanel } from "../../../../shared/pwa/PwaMaintenancePanel";
import { PwaQueueSanitizerPanel } from "../../../../shared/pwa/PwaQueueSanitizerPanel";
import { PwaRecoveryPanel } from "../../../../shared/pwa/PwaRecoveryPanel";
import { PwaSelectiveBackupPanel } from "../../../../shared/pwa/PwaSelectiveBackupPanel";
import { PwaStorageRetentionPanel } from "../../../../shared/pwa/PwaStorageRetentionPanel";
import { PwaSupportSnapshotPanel } from "../../../../shared/pwa/PwaSupportSnapshotPanel";
import { PwaSyncCenterSummary } from "../../../../shared/pwa/PwaSyncCenterSummary";
import { PwaSyncLogPanel } from "../../../../shared/pwa/PwaSyncLogPanel";
import { ScopedOfflineQueuePanel } from "../../../../shared/pwa/ScopedOfflineQueuePanel";
import "./SyncCenterPage.css";

export default function SyncCenterPage() {
  return (
    <main className="ck-sync-center-page">
      <PwaSyncCenterSummary />

      <section className="ck-sync-center-section">
        <PwaIntegrityPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaRecoveryPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaConflictResolutionPanel />
      </section>

      <section className="ck-sync-center-section">
        <ScopedOfflineQueuePanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaQueueSanitizerPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaSyncLogPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaSupportSnapshotPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaSelectiveBackupPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaStorageRetentionPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaMaintenancePanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaLocalMigrationPanel />
      </section>

      <section className="ck-sync-center-section">
        <PwaDiagnosticsPanel />
      </section>
    </main>
  );
}
