// apps/web/src/shared/pwa/usePwaSupportSnapshot.ts

import { useCallback, useState } from "react";
import { usePwaScope } from "./PwaScopeProvider";
import {
  createPwaSupportSnapshot,
  downloadPwaSupportSnapshot,
  importPwaSupportSnapshot,
  parsePwaSupportSnapshot,
  stringifyPwaSupportSnapshot,
  type PwaSupportSnapshot,
} from "./pwaSupportSnapshot";

export function usePwaSupportSnapshot() {
  const { scope } = usePwaScope();

  const [snapshot, setSnapshot] = useState<PwaSupportSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(async () => {
    setError(null);

    try {
      const next = await createPwaSupportSnapshot(scope);
      setSnapshot(next);
      return next;
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Falha ao gerar snapshot.";
      setError(message);
      return null;
    }
  }, [scope]);

  const copy = useCallback(async () => {
    const current = snapshot ?? (await createPwaSupportSnapshot(scope));
    await navigator.clipboard.writeText(stringifyPwaSupportSnapshot(current));
    setSnapshot(current);
  }, [scope, snapshot]);

  const download = useCallback(async () => {
    const current = snapshot ?? (await createPwaSupportSnapshot(scope));
    downloadPwaSupportSnapshot(current);
    setSnapshot(current);
  }, [scope, snapshot]);

  const importRaw = useCallback((raw: string) => {
    setError(null);

    try {
      const parsed = parsePwaSupportSnapshot(raw);
      importPwaSupportSnapshot(parsed);
      setSnapshot(parsed);
      return true;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Falha ao importar snapshot.",
      );
      return false;
    }
  }, []);

  return {
    snapshot,
    error,
    generate,
    copy,
    download,
    importRaw,
  };
}
