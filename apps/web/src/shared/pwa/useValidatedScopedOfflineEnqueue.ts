// apps/web/src/shared/pwa/useValidatedScopedOfflineEnqueue.ts

import { useCallback, useMemo, useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import { createValidatedScopedOfflineQueue } from "./validatedScopedOfflineQueue";

export function useValidatedScopedOfflineEnqueue() {
  const { scope } = usePwaScope();
  const queue = useMemo(() => createValidatedScopedOfflineQueue(scope), [scope]);

  const [lastError, setLastError] = useState<string | null>(null);

  const enqueue = useCallback(
    <TPayload,>(params: {
      type: string;
      payload: TPayload;
      localId?: string | null;
    }) => {
      const result = queue.enqueueValidated(params);
      setLastError(result.ok ? null : result.error);
      return result;
    },
    [queue],
  );

  return {
    enqueue,
    lastError,
    clearError: () => setLastError(null),
  };
}
