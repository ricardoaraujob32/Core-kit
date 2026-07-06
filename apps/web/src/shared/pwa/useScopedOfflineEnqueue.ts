// apps/web/src/shared/pwa/useScopedOfflineEnqueue.ts

import { useCallback, useMemo } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import { createScopedOfflineQueue } from "./scopedOfflineQueue";

export function useScopedOfflineEnqueue() {
  const { scope } = usePwaScope();

  const queue = useMemo(() => createScopedOfflineQueue(scope), [scope]);

  const enqueue = useCallback(
    <TPayload,>(params: {
      type: string;
      payload: TPayload;
      localId?: string | null;
    }) => queue.enqueue(params),
    [queue],
  );

  return {
    enqueue,
  };
}
