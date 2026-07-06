// apps/web/src/shared/pwa/offlineQueue.ts

import { offlineStorage } from "./offlineStorage";
import { classifySyncError } from "./syncErrorClassifier";
import type { PwaQueueItem, PwaQueueProcessor } from "./pwaSyncTypes";

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

export const offlineQueue = {
  list(): PwaQueueItem[] {
    return safeParseQueue(offlineStorage.getQueueRaw());
  },

  save(items: PwaQueueItem[]): void {
    offlineStorage.setQueueRaw(JSON.stringify(items));
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

    return item;
  },

  remove(id: string): void {
    this.save(this.list().filter((item) => item.id !== id));
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
  },

  unblock(id: string): void {
    this.update(id, {
      status: "pending",
      lastError: null,
      lastErrorKind: null,
      lastErrorDetails: null,
    });
  },

  async process(processor: PwaQueueProcessor): Promise<void> {
    const items = this.list().filter(
      (item) => item.status === "pending" || item.status === "failed",
    );

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
        this.remove(item.id);
      } catch (cause) {
        const classified = classifySyncError(cause);

        this.update(item.id, {
          status: classified.retryable ? "failed" : "blocked",
          lastError: classified.message,
          lastErrorKind: classified.kind,
          lastErrorDetails: classified.details,
        });
      }
    }
  },

  clear(): void {
    offlineStorage.removeQueue();
  },
};
