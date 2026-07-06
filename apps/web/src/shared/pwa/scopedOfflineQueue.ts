// apps/web/src/shared/pwa/scopedOfflineQueue.ts

import { buildPwaCacheKey, type PwaScope } from "./pwaScope";
import { classifySyncError } from "./syncErrorClassifier";
import { createPwaSyncLogStore } from "./pwaSyncLogStore";
import { invalidateCachesForSyncedItem } from "./pwaCacheInvalidation";
import {
  emitPwaItemSynced,
  emitPwaSyncCompleted,
} from "./pwaSyncEvents";
import type { PwaQueueItem, PwaQueueProcessor } from "./pwaSyncTypes";

const QUEUE_PREFIX = "corekit:pwa:queue:";

function storageKey(scope: PwaScope): string {
  return `${QUEUE_PREFIX}${buildPwaCacheKey(scope, "offline-queue")}`;
}

function safeParseQueue(raw: string | null): PwaQueueItem[] {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PwaQueueItem[]) : [];
  } catch {
    return [];
  }
}

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createScopedOfflineQueue(scope: PwaScope) {
  const syncLog = createPwaSyncLogStore(scope);

  return {
    key: storageKey(scope),

    list(): PwaQueueItem[] {
      if (typeof localStorage === "undefined") return [];
      return safeParseQueue(localStorage.getItem(storageKey(scope)));
    },

    save(items: PwaQueueItem[]): void {
      if (typeof localStorage === "undefined") return;
      localStorage.setItem(storageKey(scope), JSON.stringify(items));
    },

    enqueue<TPayload>(params: {
      type: string;
      payload: TPayload;
      localId?: string | null;
    }): PwaQueueItem<TPayload> {
      const current = this.list();

      const item: PwaQueueItem<TPayload> = {
        id: createId(),
        type: params.type,
        payload: params.payload,
        localId: params.localId ?? null,
        status: "pending",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        attempts: 0,
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      };

      this.save([item, ...current]);

      syncLog.logManualAction(`Pendência adicionada: ${item.type}`, {
        itemId: item.id,
        localId: item.localId,
      });

      return item;
    },

    remove(id: string): void {
      const item = this.list().find((current) => current.id === id);
      this.save(this.list().filter((current) => current.id !== id));

      if (item) {
        syncLog.logManualAction(`Pendência removida: ${item.type}`, {
          itemId: item.id,
          localId: item.localId,
        });
      }
    },

    update(id: string, patch: Partial<PwaQueueItem>): void {
      this.save(
        this.list().map((item) =>
          item.id === id
            ? {
                ...item,
                ...patch,
                updatedAt: nowIso(),
              }
            : item,
        ),
      );
    },

    block(id: string, reason?: string): void {
      this.update(id, {
        status: "blocked",
        lastError: reason ?? "Pendência bloqueada manualmente.",
        lastErrorKind: "unknown",
      });

      syncLog.logManualAction("Pendência bloqueada manualmente.", { id, reason });
    },

    unblock(id: string): void {
      this.update(id, {
        status: "pending",
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });

      syncLog.logManualAction("Pendência desbloqueada.", { id });
    },

    async process(processor: PwaQueueProcessor): Promise<void> {
      const items = this.list().filter(
        (item) => item.status === "pending" || item.status === "failed",
      );

      if (items.length === 0) return;

      syncLog.logSyncStarted({
        count: items.length,
      });

      let syncedAny = false;
      let failedAny = false;

      for (const item of items.reverse()) {
        this.update(item.id, {
          status: "syncing",
          attempts: item.attempts + 1,
          lastError: null,
          lastErrorKind: null,
          lastErrorDetails: null,
        });

        try {
          await processor(item);

          invalidateCachesForSyncedItem({
            scope,
            item,
          });

          emitPwaItemSynced(item);
          syncLog.logItemSuccess(item);

          this.remove(item.id);
          syncedAny = true;
        } catch (cause) {
          const classified = classifySyncError(cause);

          this.update(item.id, {
            status: classified.retryable ? "failed" : "blocked",
            lastError: classified.message,
            lastErrorKind: classified.kind,
            lastErrorDetails: classified.details,
          });

          syncLog.logItemFailed(item, {
            errorKind: classified.kind,
            errorMessage: classified.message,
            meta: classified.details,
          });

          failedAny = true;
        }
      }

      if (syncedAny) {
        emitPwaSyncCompleted();
      }

      syncLog.logSyncCompleted({
        syncedAny,
        failedAny,
      });
    },

    clear(): void {
      if (typeof localStorage === "undefined") return;
      localStorage.removeItem(storageKey(scope));
      syncLog.logManualAction("Fila offline limpa.");
    },
  };
}
