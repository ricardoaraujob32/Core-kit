// apps/web/src/shared/pwa/usePwaSyncLog.ts

import { useCallback, useMemo, useState } from "react";
import { createPwaSyncLogStore } from "./pwaSyncLogStore";
import { usePwaScope } from "./PwaScopeProvider";

export function usePwaSyncLog() {
  const { scope } = usePwaScope();
  const store = useMemo(() => createPwaSyncLogStore(scope), [scope]);

  const [entries, setEntries] = useState(() => store.list());

  const refresh = useCallback(() => {
    setEntries(store.list());
  }, [store]);

  const clear = useCallback(() => {
    store.clear();
    refresh();
  }, [store, refresh]);

  const exportJson = useCallback(() => store.exportJson(), [store]);

  const copyJson = useCallback(async () => {
    await navigator.clipboard.writeText(store.exportJson());
  }, [store]);

  return {
    entries,
    refresh,
    clear,
    exportJson,
    copyJson,
  };
}
