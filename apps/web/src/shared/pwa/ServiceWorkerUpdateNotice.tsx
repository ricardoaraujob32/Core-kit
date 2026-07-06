// apps/web/src/shared/pwa/ServiceWorkerUpdateNotice.tsx

import { useServiceWorkerUpdate } from "./useServiceWorkerUpdate";

export function ServiceWorkerUpdateNotice() {
  const update = useServiceWorkerUpdate();

  if (!update.hasUpdate) return null;

  return (
    <div className="ck-register-alert">
      Nova versão disponível.

      <button
        className="ck-register-button"
        type="button"
        onClick={update.applyUpdate}
      >
        Atualizar agora
      </button>

      <button
        className="ck-register-button"
        type="button"
        onClick={update.dismissUpdate}
      >
        Depois
      </button>
    </div>
  );
}
