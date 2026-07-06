// apps/web/src/shared/pwa/useServiceWorkerUpdate.ts

import { useEffect, useState } from "react";
import { applyServiceWorkerUpdate } from "./registerServiceWorker";

export function useServiceWorkerUpdate() {
  const [hasUpdate, setHasUpdate] = useState(false);

  useEffect(() => {
    function handleUpdate() {
      setHasUpdate(true);
    }

    window.addEventListener("corekit:pwa-update", handleUpdate);

    return () => {
      window.removeEventListener("corekit:pwa-update", handleUpdate);
    };
  }, []);

  return {
    hasUpdate,
    applyUpdate: applyServiceWorkerUpdate,
    dismissUpdate: () => setHasUpdate(false),
  };
}
