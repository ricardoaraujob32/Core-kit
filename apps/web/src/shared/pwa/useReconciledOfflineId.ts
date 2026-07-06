// apps/web/src/shared/pwa/useReconciledOfflineId.ts

import { useCallback, useMemo, useState } from "react";
import { isOfflineEntityId } from "./createOfflineEntity";
import type { OfflineEntityKind } from "./offlineIdMap";
import { createScopedOfflineIdMap } from "./scopedOfflineIdMap";
import { usePwaScope } from "./PwaScopeProvider";
import { usePwaSyncEvents } from "./usePwaSyncEvents";

type UseReconciledOfflineIdParams = {
  kind: OfflineEntityKind;
  id?: string | null;
};

export function useReconciledOfflineId({
  kind,
  id,
}: UseReconciledOfflineIdParams) {
  const { scope } = usePwaScope();
  const [version, setVersion] = useState(0);

  const idMap = useMemo(() => createScopedOfflineIdMap(scope), [scope]);

  const resolvedId = useMemo(() => {
    if (!id) return null;
    return idMap.resolve(kind, id);
  }, [id, idMap, kind, version]);

  const isOfflineId = Boolean(id && isOfflineEntityId(id));
  const isReconciled = Boolean(
    isOfflineId &&
      resolvedId &&
      resolvedId !== id &&
      !isOfflineEntityId(resolvedId),
  );

  const refresh = useCallback(() => {
    setVersion((current) => current + 1);
  }, []);

  usePwaSyncEvents({
    onItemSynced: refresh,
    onSyncCompleted: refresh,
  });

  return {
    originalId: id ?? null,
    resolvedId,
    isOfflineId,
    isReconciled,
    refresh,
  };
}
