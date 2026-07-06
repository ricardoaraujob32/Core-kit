// apps/web/src/shared/pwa/usePwaStorageRetention.ts

import { useCallback, useState } from "react";
import {
  runPwaRetentionPolicy,
  type PwaRetentionResult,
} from "./pwaRetentionPolicy";
import { getPwaStorageUsage, type PwaStorageUsageReport } from "./pwaStorageUsage";

export function usePwaStorageRetention() {
  const [usage, setUsage] = useState<PwaStorageUsageReport>(() =>
    getPwaStorageUsage(),
  );

  const [lastCleanup, setLastCleanup] = useState<PwaRetentionResult | null>(
    null,
  );

  const refresh = useCallback(() => {
    setUsage(getPwaStorageUsage());
  }, []);

  const cleanup = useCallback(() => {
    const result = runPwaRetentionPolicy();

    setLastCleanup(result);
    setUsage(getPwaStorageUsage());

    return result;
  }, []);

  return {
    usage,
    lastCleanup,
    refresh,
    cleanup,
  };
}
