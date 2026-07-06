// apps/web/src/shared/pwa/validatedScopedOfflineQueue.ts

import { createScopedOfflineQueue } from "./scopedOfflineQueue";
import { validateAndNormalizePwaPayload } from "./pwaPayloadValidation";
import type { PwaScope } from "./pwaScope";
import type { PwaQueueItem } from "./pwaSyncTypes";

export type ValidatedEnqueueResult<TPayload = unknown> =
  | {
      ok: true;
      item: PwaQueueItem<TPayload>;
      error: null;
    }
  | {
      ok: false;
      item: null;
      error: string;
    };

export function createValidatedScopedOfflineQueue(scope: PwaScope) {
  const queue = createScopedOfflineQueue(scope);

  return {
    ...queue,

    enqueueValidated<TPayload>(params: {
      type: string;
      payload: TPayload;
      localId?: string | null;
    }): ValidatedEnqueueResult {
      try {
        const draftItem = {
          id: "draft",
          type: params.type,
          payload: params.payload,
          localId: params.localId ?? null,
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          attempts: 0,
          lastError: null,
          lastErrorKind: null,
          lastErrorDetails: null,
        } satisfies PwaQueueItem<TPayload>;

        const normalizedPayload = validateAndNormalizePwaPayload(draftItem);

        const item = queue.enqueue({
          type: params.type,
          payload: normalizedPayload,
          localId: params.localId ?? null,
        });

        return {
          ok: true,
          item,
          error: null,
        };
      } catch (cause) {
        return {
          ok: false,
          item: null,
          error:
            cause instanceof Error
              ? cause.message
              : "Payload offline inválido.",
        };
      }
    },
  };
}
