// apps/web/src/shared/pwa/usePwaSelectiveBackup.ts

import { useCallback, useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import {
  clearPwaSelectiveData,
  createPwaSelectiveBackup,
  parsePwaSelectiveBackup,
  restorePwaSelectiveBackup,
  stringifyPwaSelectiveBackup,
  type PwaSelectiveBackup,
  type PwaSelectiveBackupKind,
} from "./pwaSelectiveBackup";

export function usePwaSelectiveBackup() {
  const { scope } = usePwaScope();

  const [backup, setBackup] = useState<PwaSelectiveBackup | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    (kind: PwaSelectiveBackupKind) => {
      setError(null);

      try {
        const next = createPwaSelectiveBackup({ scope, kind });
        setBackup(next);
        return next;
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Falha ao criar backup.";
        setError(message);
        return null;
      }
    },
    [scope],
  );

  const copy = useCallback(async () => {
    if (!backup) return;
    await navigator.clipboard.writeText(stringifyPwaSelectiveBackup(backup));
  }, [backup]);

  const restoreRaw = useCallback(
    (raw: string, mode: "replace" | "merge") => {
      setError(null);

      try {
        const parsed = parsePwaSelectiveBackup(raw);

        restorePwaSelectiveBackup({
          scope,
          backup: parsed,
          mode,
        });

        setBackup(parsed);
        return true;
      } catch (cause) {
        setError(
          cause instanceof Error
            ? cause.message
            : "Falha ao restaurar backup.",
        );
        return false;
      }
    },
    [scope],
  );

  const clear = useCallback(
    (kind: PwaSelectiveBackupKind) => {
      clearPwaSelectiveData({ scope, kind });
    },
    [scope],
  );

  return {
    backup,
    error,
    create,
    copy,
    restoreRaw,
    clear,
  };
}
