// apps/web/src/shared/pwa/useOfflineIdResolver.ts

import { useCallback, useState } from "react";
import {
  offlineIdMap,
  resolveOfflineId,
  type OfflineEntityKind,
  type OfflineIdMapEntry,
} from "./offlineIdMap";

export function useOfflineIdResolver() {
  const [entries, setEntries] = useState<OfflineIdMapEntry[]>(
    () => offlineIdMap.list(),
  );

  const refresh = useCallback(() => {
    setEntries(offlineIdMap.list());
  }, []);

  const resolve = useCallback(
    (kind: OfflineEntityKind, id: string | null | undefined) =>
      resolveOfflineId(kind, id),
    [],
  );

  return {
    entries,
    refresh,
    resolve,
  };
}
