// apps/web/src/shared/pwa/usePwaAuthSession.ts

import { useCallback, useEffect, useState } from "react";
import {
  getPwaAuthSessionState,
  type PwaAuthSessionState,
} from "./pwaAuthSession";

export function usePwaAuthSession() {
  const [session, setSession] = useState<PwaAuthSessionState>(() =>
    getPwaAuthSessionState(),
  );

  const refresh = useCallback(() => {
    setSession(getPwaAuthSessionState());
  }, []);

  useEffect(() => {
    function handleStorage() {
      refresh();
    }

    function handleFocus() {
      refresh();
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("corekit:auth-changed", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("corekit:auth-changed", handleStorage);
    };
  }, [refresh]);

  return {
    ...session,
    refresh,
  };
}
