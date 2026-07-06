// apps/web/src/shared/pwa/pwaSyncLogStore.ts

import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import type { PwaQueueItem, PwaSyncErrorKind } from "./pwaSyncTypes";

const SYNC_LOG_PREFIX = "corekit:pwa:sync-log:";
const MAX_LOG_ENTRIES = 300;

export type PwaSyncLogLevel = "info" | "success" | "warning" | "error";

export type PwaSyncLogEntry = {
  id: string;
  level: PwaSyncLogLevel;
  event:
    | "sync.started"
    | "sync.item.success"
    | "sync.item.failed"
    | "sync.completed"
    | "sync.sanitized"
    | "sync.manual_action";
  message: string;
  itemId?: string | null;
  itemType?: string | null;
  localId?: string | null;
  errorKind?: PwaSyncErrorKind | null;
  errorMessage?: string | null;
  createdAt: string;
  meta?: unknown;
};

function storageKey(scope: PwaScope): string {
  return `${SYNC_LOG_PREFIX}${buildPwaCacheKey(scope, "history")}`;
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function safeParse(raw: string | null): PwaSyncLogEntry[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PwaSyncLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function createPwaSyncLogStore(scope: PwaScope) {
  return {
    key: storageKey(scope),

    list(): PwaSyncLogEntry[] {
      if (typeof localStorage === "undefined") return [];
      return safeParse(localStorage.getItem(storageKey(scope)));
    },

    append(entry: Omit<PwaSyncLogEntry, "id" | "createdAt">): PwaSyncLogEntry {
      const next: PwaSyncLogEntry = {
        ...entry,
        id: createId(),
        createdAt: new Date().toISOString(),
      };

      const current = this.list();
      const updated = [next, ...current].slice(0, MAX_LOG_ENTRIES);

      localStorage.setItem(storageKey(scope), JSON.stringify(updated));

      return next;
    },

    logSyncStarted(meta?: unknown) {
      return this.append({
        level: "info",
        event: "sync.started",
        message: "Sincronização iniciada.",
        meta,
      });
    },

    logSyncCompleted(meta?: unknown) {
      return this.append({
        level: "success",
        event: "sync.completed",
        message: "Sincronização concluída.",
        meta,
      });
    },

    logItemSuccess(item: PwaQueueItem) {
      return this.append({
        level: "success",
        event: "sync.item.success",
        message: `Pendência sincronizada: ${item.type}`,
        itemId: item.id,
        itemType: item.type,
        localId: item.localId ?? null,
      });
    },

    logItemFailed(item: PwaQueueItem, params: {
      errorKind?: PwaSyncErrorKind | null;
      errorMessage?: string | null;
      meta?: unknown;
    }) {
      return this.append({
        level: params.errorKind === "temporary" ? "warning" : "error",
        event: "sync.item.failed",
        message: `Falha ao sincronizar: ${item.type}`,
        itemId: item.id,
        itemType: item.type,
        localId: item.localId ?? null,
        errorKind: params.errorKind ?? null,
        errorMessage: params.errorMessage ?? null,
        meta: params.meta,
      });
    },

    logManualAction(message: string, meta?: unknown) {
      return this.append({
        level: "info",
        event: "sync.manual_action",
        message,
        meta,
      });
    },

    clear() {
      localStorage.removeItem(storageKey(scope));
    },

    exportJson(): string {
      return JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          key: storageKey(scope),
          entries: this.list(),
        },
        null,
        2,
      );
    },
  };
}
