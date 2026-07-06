// apps/web/src/shared/pwa/useRedirectWhenOfflineIdReconciled.ts

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { OfflineEntityKind } from "./offlineIdMap";
import { cleanupOfflineDetailAfterReconciliation } from "./scopedOfflineDetailsCleanup";
import { usePwaScope } from "./PwaScopeProvider";
import { useReconciledOfflineId } from "./useReconciledOfflineId";

type UseRedirectWhenOfflineIdReconciledParams = {
  kind: OfflineEntityKind;
  id?: string | null;
  buildPath: (resolvedId: string) => string;
  cleanupLocalDetail?: boolean;
};

export function useRedirectWhenOfflineIdReconciled({
  kind,
  id,
  buildPath,
  cleanupLocalDetail = true,
}: UseRedirectWhenOfflineIdReconciledParams) {
  const navigate = useNavigate();
  const { scope } = usePwaScope();

  const reconciliation = useReconciledOfflineId({
    kind,
    id,
  });

  useEffect(() => {
    if (!reconciliation.isReconciled || !reconciliation.resolvedId || !id) {
      return;
    }

    if (cleanupLocalDetail) {
      cleanupOfflineDetailAfterReconciliation({
        scope,
        kind,
        localId: id,
      });
    }

    navigate(buildPath(reconciliation.resolvedId), {
      replace: true,
    });
  }, [
    buildPath,
    cleanupLocalDetail,
    id,
    kind,
    navigate,
    reconciliation.isReconciled,
    reconciliation.resolvedId,
    scope,
  ]);

  return reconciliation;
}
