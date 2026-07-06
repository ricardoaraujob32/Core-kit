// apps/web/src/shared/pwa/usePwaIntegrityCheck.ts

import { useCallback, useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import {
  runPwaIntegrityCheck,
  type PwaIntegrityReport,
} from "./pwaIntegrityCheck";

export function usePwaIntegrityCheck() {
  const { scope } = usePwaScope();

  const [report, setReport] = useState<PwaIntegrityReport | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async () => {
    setIsChecking(true);

    try {
      const next = await runPwaIntegrityCheck(scope);
      setReport(next);
      return next;
    } finally {
      setIsChecking(false);
    }
  }, [scope]);

  return {
    report,
    isChecking,
    check,
  };
}
