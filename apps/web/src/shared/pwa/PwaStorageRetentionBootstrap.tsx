// apps/web/src/shared/pwa/PwaStorageRetentionBootstrap.tsx

import { useEffect, useRef } from "react";
import { runPwaRetentionPolicy } from "./pwaRetentionPolicy";

const LAST_RETENTION_KEY = "corekit:pwa:last-retention-run";
const MIN_INTERVAL_HOURS = 24;

function shouldRun(): boolean {
  if (typeof localStorage === "undefined") return false;

  const raw = localStorage.getItem(LAST_RETENTION_KEY);
  const last = raw ? Number(raw) : 0;

  if (!Number.isFinite(last)) return true;

  return Date.now() - last > MIN_INTERVAL_HOURS * 60 * 60 * 1000;
}

export function PwaStorageRetentionBootstrap() {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    if (!shouldRun()) return;

    runPwaRetentionPolicy();
    localStorage.setItem(LAST_RETENTION_KEY, String(Date.now()));
  }, []);

  return null;
}
