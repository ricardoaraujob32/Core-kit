// apps/web/src/shared/pwa/usePwaRecovery.ts

import { useCallback, useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import {
  runPwaRecoveryAction,
  type PwaRecoveryAction,
  type PwaRecoveryResult,
} from "./pwaRecovery";

export function usePwaRecovery() {
  const { scope } = usePwaScope();

  const [lastResult, setLastResult] = useState<PwaRecoveryResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async (action: PwaRecoveryAction) => {
      setIsRunning(true);

      try {
        const result = await runPwaRecoveryAction({
          scope,
          action,
        });

        setLastResult(result);
        return result;
      } finally {
        setIsRunning(false);
      }
    },
    [scope],
  );

  return {
    run,
    lastResult,
    isRunning,
  };
}
