// apps/web/src/shared/pwa/usePwaLocalMigration.ts

import { useCallback, useState } from "react";
import {
  getPwaLocalSchemaStatus,
  type PwaLocalSchemaStatus,
} from "./pwaLocalSchema";
import {
  runPwaLocalMigrations,
  type PwaLocalMigrationResult,
} from "./pwaLocalMigrations";

export function usePwaLocalMigration() {
  const [status, setStatus] = useState<PwaLocalSchemaStatus>(() =>
    getPwaLocalSchemaStatus(),
  );

  const [lastResult, setLastResult] =
    useState<PwaLocalMigrationResult | null>(null);

  const refresh = useCallback(() => {
    setStatus(getPwaLocalSchemaStatus());
  }, []);

  const migrate = useCallback(() => {
    const result = runPwaLocalMigrations();
    setLastResult(result);
    setStatus(getPwaLocalSchemaStatus());

    window.dispatchEvent(
      new CustomEvent("corekit:pwa-local-schema-migrated", {
        detail: result,
      }),
    );

    return result;
  }, []);

  return {
    status,
    lastResult,
    refresh,
    migrate,
  };
}
