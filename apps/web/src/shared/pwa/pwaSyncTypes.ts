// apps/web/src/shared/pwa/pwaSyncTypes.ts

export type PwaCacheRecord<TData = unknown> = {
  key: string;
  data: TData;
  updatedAt: string;
  version: number;
};

export type PwaQueueStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "failed"
  | "blocked";

export type PwaSyncErrorKind =
  | "temporary"
  | "validation"
  | "permission"
  | "conflict"
  | "dependency"
  | "unknown";

export type PwaSyncError = {
  kind: PwaSyncErrorKind;
  message: string;
  retryable: boolean;
  details?: unknown;
};

export type PwaQueueItem<TPayload = unknown> = {
  id: string;
  type: string;
  payload: TPayload;
  localId?: string | null;
  status: PwaQueueStatus;
  createdAt: string;
  updatedAt: string;
  attempts: number;
  lastError: string | null;
  lastErrorKind?: PwaSyncErrorKind | null;
  lastErrorDetails?: unknown;
};

export type PwaQueueProcessor = (
  item: PwaQueueItem,
) => Promise<void>;

export type CachedResourceState<TData> = {
  data: TData;
  isLoading: boolean;
  isRefreshing: boolean;
  isFromCache: boolean;
  error: string | null;
  updatedAt: string | null;
  reload: () => Promise<void>;
};
