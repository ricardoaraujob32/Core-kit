// apps/web/src/core/auth/sessionManager.ts

import type { SessionUser } from "./tipos";

export const DEFAULT_TENANT_IDLE_TIMEOUT_MS = 60 * 60 * 1000;
export const DEFAULT_PLATAFORMA_IDLE_TIMEOUT_MS = 20 * 60 * 1000;

const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "click",
  "keydown",
  "mousemove",
  "mousedown",
  "scroll",
  "touchstart",
];

function readTimeoutEnv(
  key: "VITE_TENANT_IDLE_TIMEOUT_MS" | "VITE_PLATAFORMA_IDLE_TIMEOUT_MS",
  fallback: number,
): number {
  const raw = import.meta.env[key];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function getIdleTimeoutMs(user: SessionUser | null): number {
  if (user?.perfil === "PLATAFORMA") {
    return readTimeoutEnv(
      "VITE_PLATAFORMA_IDLE_TIMEOUT_MS",
      DEFAULT_PLATAFORMA_IDLE_TIMEOUT_MS,
    );
  }

  return readTimeoutEnv(
    "VITE_TENANT_IDLE_TIMEOUT_MS",
    DEFAULT_TENANT_IDLE_TIMEOUT_MS,
  );
}

export type InactivityWatcherParams = {
  user: SessionUser;
  onExpired: () => void | Promise<void>;
};

export function setupInactivityWatcher({
  user,
  onExpired,
}: InactivityWatcherParams): () => void {
  const timeoutMs = getIdleTimeoutMs(user);

  let timeoutId: number | undefined;
  let expired = false;

  async function expireSession() {
    if (expired) return;
    expired = true;
    await onExpired();
  }

  function resetTimer() {
    if (expired) return;

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      void expireSession();
    }, timeoutMs);
  }

  for (const eventName of ACTIVITY_EVENTS) {
    window.addEventListener(eventName, resetTimer, { passive: true });
  }

  resetTimer();

  return () => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }

    for (const eventName of ACTIVITY_EVENTS) {
      window.removeEventListener(eventName, resetTimer);
    }
  };
}
