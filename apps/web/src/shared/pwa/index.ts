// apps/web/src/shared/pwa/index.ts

export * from "./pwaSyncTypes";
export * from "./pwaScope";
export * from "./PwaScopeProvider";

export * from "./registerServiceWorker";
export * from "./useServiceWorkerUpdate";
export * from "./ServiceWorkerUpdateNotice";

export * from "./useOnlineStatus";

export * from "./offlineStorage";
export * from "./offlineIdMap";
export * from "./scopedOfflineIdMap";
export * from "./offlineDependencies";
export * from "./createOfflineEntity";

export * from "./pwaAuthSession";
export * from "./pwaAuthRefresh";
export * from "./pwaAuthRetryQueue";
export * from "./usePwaAuthSession";
export * from "./usePwaAuthRefresh";
export * from "./AuthAwareOfflineSyncBootstrap";
export * from "./AuthAwareOfflineSyncStatus";

export * from "./pwaPayloadNormalizers";
export * from "./pwaPayloadValidation";

export * from "./offlineQueue";
export * from "./scopedOfflineQueue";
export * from "./validatedScopedOfflineQueue";
export * from "./useOfflineMutationQueue";
export * from "./useScopedOfflineMutationQueue";
export * from "./useScopedOfflineEnqueue";
export * from "./useValidatedScopedOfflineEnqueue";
export * from "./useOfflineQueueView";
export * from "./useScopedOfflineQueueView";

export * from "./createScopedOfflineProcessor";
export * from "./offlineCreateProcessor";
export * from "./syncErrorClassifier";

export * from "./pwaQueueSanitizer";
export * from "./usePwaQueueSanitizer";
export * from "./PwaQueueSanitizerPanel";

export * from "./pwaSyncEvents";
export * from "./usePwaSyncEvents";
export * from "./pwaCacheInvalidation";
export * from "./useReloadOnPwaInvalidation";

export * from "./pwaSyncLogStore";
export * from "./usePwaSyncLog";
export * from "./PwaSyncLogPanel";

export * from "./scopedOfflineDetailsStore";
export * from "./scopedOfflineDetailsCleanup";
export * from "./useOfflineEntityDetail";
export * from "./useOfflineIdResolver";
export * from "./useReconciledOfflineId";
export * from "./useRedirectWhenOfflineIdReconciled";
export * from "./useCleanupOfflineDetailAfterSync";
export * from "./ReconciledRedirectNotice";

export * from "./pwaPendingHelpers";
export * from "./pwaPendingProjections";
export * from "./usePwaPendingProjections";
export * from "./useMergePwaPendingItems";
export * from "./usePendingQueueItems";
export * from "./PwaPendingBadge";
export * from "./PwaSyncBadge";
export * from "./PwaPendingPanel";

export * from "./pwaQueueIssueHelpers";
export * from "./PwaQueueIssueCard";
export * from "./PwaConflictResolutionPanel";
export * from "./useEditScopedQueueItem";
export * from "./PwaPendingPayloadEditor";
export * from "./PwaTypedPendingEditor";
export * from "./editors/PwaClientePendingEditor";
export * from "./editors/PwaFornecedorPendingEditor";
export * from "./editors/PwaServicoPendingEditor";
export * from "./editors/PwaVendaPendingEditor";
export * from "./editors/PwaCompraPendingEditor";
export * from "./editors/PwaOrdemServicoPendingEditor";
export * from "./editors/PwaItemTransacaoPendingEditor";

export * from "./OfflineSyncBootstrap";
export * from "./OfflineSyncStatus";
export * from "./ScopedOfflineSyncBootstrap";
export * from "./ScopedOfflineSyncStatus";
export * from "./OfflineQueuePanel";
export * from "./ScopedOfflineQueuePanel";
export * from "./OfflineQueueTable";
export * from "./OfflineQueueDetails";

export * from "./PwaResourceNotice";
export * from "./PwaLayout";
export * from "./PwaSyncCenterSummary";

export * from "./pwaDiagnostics";
export * from "./PwaDiagnosticsPanel";

export * from "./pwaMaintenance";
export * from "./PwaMaintenancePanel";

export * from "./pwaLocalSchema";
export * from "./pwaLocalMigrations";
export * from "./usePwaLocalMigration";
export * from "./PwaLocalMigrationBootstrap";
export * from "./PwaLocalMigrationPanel";

export * from "./pwaStorageUsage";
export * from "./pwaRetentionPolicy";
export * from "./usePwaStorageRetention";
export * from "./PwaStorageRetentionPanel";
export * from "./PwaStorageRetentionBootstrap";

export * from "./pwaSupportSnapshot";
export * from "./usePwaSupportSnapshot";
export * from "./PwaSupportSnapshotPanel";

export * from "./pwaSelectiveBackup";
export * from "./usePwaSelectiveBackup";
export * from "./PwaSelectiveBackupPanel";

export * from "./pwaIntegrityCheck";
export * from "./usePwaIntegrityCheck";
export * from "./PwaIntegrityPanel";

export * from "./pwaRecovery";
export * from "./usePwaRecovery";
export * from "./PwaRecoveryPanel";

export * from "./useAsyncResource";
export * from "./useLocalFilters";
export * from "./usePwaDraft";
