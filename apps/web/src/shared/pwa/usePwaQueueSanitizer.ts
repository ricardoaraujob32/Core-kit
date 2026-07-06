// apps/web/src/shared/pwa/usePwaQueueSanitizer.ts

import { useCallback, useState } from "react";
import {
  sanitizeScopedOfflineQueue,
  type PwaQueueSanitizerReport,
} from "./pwaQueueSanitizer";
import { usePwaScope } from "./PwaScopeProvider";

export function usePwaQueueSanitizer() {
  const { scope } = usePwaScope();
  const [lastReport, setLastReport] =
    useState<PwaQueueSanitizerReport | null>(null);

  const sanitize = useCallback(() => {
    const report = sanitizeScopedOfflineQueue(scope);
    setLastReport(report);
    return report;
  }, [scope]);

  return {
    sanitize,
    lastReport,
  };
}
