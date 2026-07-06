// apps/web/src/shared/pwa/registerServiceWorker.ts

type RegisterServiceWorkerOptions = {
  onUpdateAvailable?: (registration: ServiceWorkerRegistration) => void;
  onRegistered?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: unknown) => void;

  /**
   * Em produção, o service worker sempre pode ser registrado.
   * Em dev, normalmente fica desativado para evitar cache antigo.
   *
   * Para testar PWA no localhost dev, chame:
   *
   * registerServiceWorker({ enabledInDev: true })
   */
  enabledInDev?: boolean;
};

function canRegisterServiceWorker(enabledInDev: boolean): boolean {
  if (!("serviceWorker" in navigator)) return false;

  if (import.meta.env.DEV && !enabledInDev) return false;

  return true;
}

export function registerServiceWorker(options: RegisterServiceWorkerOptions = {}) {
  const enabledInDev = options.enabledInDev ?? false;

  if (!canRegisterServiceWorker(enabledInDev)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        options.onRegistered?.(registration);

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;

          if (!worker) return;

          worker.addEventListener("statechange", () => {
            if (
              worker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              options.onUpdateAvailable?.(registration);
              window.dispatchEvent(new CustomEvent("corekit:pwa-update"));
            }
          });
        });
      })
      .catch((error) => {
        options.onError?.(error);
      });
  });
}

export function applyServiceWorkerUpdate() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistration().then((registration) => {
    registration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

export async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  const registrations = await navigator.serviceWorker.getRegistrations();

  await Promise.all(registrations.map((registration) => registration.unregister()));
}
