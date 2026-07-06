// apps/web/scripts/pwa-smoke-console.js

/**
 * Cole este script no console do navegador.
 *
 * Ele ajuda a diagnosticar:
 * - manifest ausente;
 * - SW registrado mas sem controller;
 * - caches ausentes;
 * - necessidade de recarregar a página.
 */

(async function pwaSmokeTest() {
  const result = {
    url: location.href,
    online: navigator.onLine,
    standalone:
      window.matchMedia?.("(display-mode: standalone)")?.matches ?? false,
    serviceWorkerSupported: "serviceWorker" in navigator,
    serviceWorkerController: Boolean(navigator.serviceWorker?.controller),
    serviceWorkerRegistration: null,
    manifestLinkHref: null,
    manifest: null,
    caches: [],
    pwaLocalStorageKeys: [],
    recommendations: [],
    errors: [],
  };

  try {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    result.manifestLinkHref = manifestLink?.getAttribute("href") ?? null;

    if (!result.manifestLinkHref) {
      result.recommendations.push(
        "Adicionar <link rel='manifest' href='/manifest.webmanifest'> no index.html.",
      );
    } else {
      const response = await fetch(result.manifestLinkHref, {
        cache: "no-store",
      });

      if (!response.ok) {
        result.errors.push(
          `Manifest retornou HTTP ${response.status}: ${result.manifestLinkHref}`,
        );
      } else {
        result.manifest = await response.json();
      }
    }
  } catch (error) {
    result.errors.push(`manifest: ${error.message}`);
  }

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();

      result.serviceWorkerRegistration = registration
        ? {
            scope: registration.scope,
            active: Boolean(registration.active),
            installing: Boolean(registration.installing),
            waiting: Boolean(registration.waiting),
          }
        : null;

      if (!registration) {
        result.recommendations.push(
          "Service worker não registrado. Verifique se registerServiceWorker() foi chamado no main.tsx.",
        );
      } else if (!navigator.serviceWorker.controller) {
        result.recommendations.push(
          "Service worker registrado, mas ainda não controla a página. Recarregue a página uma vez.",
        );
      }
    } else {
      result.recommendations.push("Navegador não suporta service worker.");
    }
  } catch (error) {
    result.errors.push(`serviceWorker: ${error.message}`);
  }

  try {
    if ("caches" in window) {
      result.caches = await caches.keys();

      if (result.caches.length === 0) {
        result.recommendations.push(
          "Nenhum cache encontrado. Confirme se /sw.js está sendo carregado e recarregue a página.",
        );
      }
    }
  } catch (error) {
    result.errors.push(`caches: ${error.message}`);
  }

  try {
    result.pwaLocalStorageKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith("corekit:pwa:"),
    );
  } catch (error) {
    result.errors.push(`localStorage: ${error.message}`);
  }

  console.table({
    online: result.online,
    standalone: result.standalone,
    manifestLink: Boolean(result.manifestLinkHref),
    manifestLoaded: Boolean(result.manifest),
    serviceWorkerSupported: result.serviceWorkerSupported,
    serviceWorkerRegistered: Boolean(result.serviceWorkerRegistration),
    serviceWorkerController: result.serviceWorkerController,
    cacheCount: result.caches.length,
    pwaLocalStorageKeys: result.pwaLocalStorageKeys.length,
    recommendations: result.recommendations.length,
    errors: result.errors.length,
  });

  console.log("PWA smoke result:", result);

  return result;
})();
