// apps/web/src/shared/pwa/pwaQueueSanitizer.ts

import { validateAndNormalizePwaPayload } from "./pwaPayloadValidation";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import type { PwaScope } from "./pwaScope";
import type { PwaQueueItem } from "./pwaSyncTypes";

export type PwaQueueSanitizerReport = {
  checked: number;
  normalized: number;
  blocked: number;
  unchanged: number;
  generatedAt: string;
  items: Array<{
    id: string;
    type: string;
    status: PwaQueueItem["status"];
    action: "normalized" | "blocked" | "unchanged";
    message: string | null;
  }>;
};

function isSamePayload(a: unknown, b: unknown): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function sanitizeScopedOfflineQueue(
  scope: PwaScope,
): PwaQueueSanitizerReport {
  const queue = createScopedOfflineQueue(scope);
  const items = queue.list();

  const report: PwaQueueSanitizerReport = {
    checked: items.length,
    normalized: 0,
    blocked: 0,
    unchanged: 0,
    generatedAt: new Date().toISOString(),
    items: [],
  };

  for (const item of items) {
    if (item.status === "syncing") {
      report.unchanged += 1;
      report.items.push({
        id: item.id,
        type: item.type,
        status: item.status,
        action: "unchanged",
        message: "Item em sincronização não foi alterado.",
      });
      continue;
    }

    try {
      const normalizedPayload = validateAndNormalizePwaPayload(item);

      if (isSamePayload(item.payload, normalizedPayload)) {
        report.unchanged += 1;
        report.items.push({
          id: item.id,
          type: item.type,
          status: item.status,
          action: "unchanged",
          message: null,
        });
        continue;
      }

      queue.update(item.id, {
        payload: normalizedPayload,
        lastError: null,
        lastErrorKind: null,
        lastErrorDetails: null,
      });

      report.normalized += 1;
      report.items.push({
        id: item.id,
        type: item.type,
        status: item.status,
        action: "normalized",
        message: "Payload normalizado.",
      });
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Payload inválido na fila offline.";

      queue.update(item.id, {
        status: "blocked",
        lastError: message,
        lastErrorKind: "validation",
        lastErrorDetails: {
          source: "pwaQueueSanitizer",
          cause,
        },
      });

      report.blocked += 1;
      report.items.push({
        id: item.id,
        type: item.type,
        status: "blocked",
        action: "blocked",
        message,
      });
    }
  }

  window.dispatchEvent(
    new CustomEvent("corekit:pwa-queue-sanitized", {
      detail: report,
    }),
  );

  return report;
}
