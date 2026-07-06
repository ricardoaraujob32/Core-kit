// apps/web/src/shared/pwa/useOfflineEntityDetail.ts

import { useCallback, useMemo, useState } from "react";
import { isOfflineEntityId } from "./createOfflineEntity";
import {
  createScopedOfflineDetailsStore,
  type OfflineDetailKind,
} from "./scopedOfflineDetailsStore";
import { usePwaScope } from "./PwaScopeProvider";

type UseOfflineEntityDetailParams<TDetail> = {
  kind: OfflineDetailKind;
  id?: string | null;
  fallback?: TDetail | null;
};

export function useOfflineEntityDetail<TDetail>({
  kind,
  id,
  fallback = null,
}: UseOfflineEntityDetailParams<TDetail>) {
  const { scope } = usePwaScope();
  const store = useMemo(() => createScopedOfflineDetailsStore(scope), [scope]);

  const [version, setVersion] = useState(0);

  const isOfflineDetail = Boolean(id && isOfflineEntityId(id));

  const envelope = useMemo(() => {
    if (!id || !isOfflineDetail) return null;
    return store.getEnvelope<TDetail>(kind, id);
  }, [id, isOfflineDetail, kind, store, version]);

  const detail = envelope?.detail ?? fallback;
  const updatedAt = envelope?.updatedAt ?? null;

  const save = useCallback(
    (next: TDetail) => {
      if (!id) return;

      store.set(kind, id, next);
      setVersion((current) => current + 1);
    },
    [id, kind, store],
  );

  const remove = useCallback(() => {
    if (!id) return;

    store.remove(kind, id);
    setVersion((current) => current + 1);
  }, [id, kind, store]);

  return {
    isOfflineDetail,
    detail,
    updatedAt,
    save,
    remove,
    reloadLocal: () => setVersion((current) => current + 1),
  };
}
