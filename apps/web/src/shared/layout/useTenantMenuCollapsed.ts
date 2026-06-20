// apps/web/src/shared/layout/useTenantMenuCollapsed.ts

import { useEffect, useState } from "react";

const STORAGE_KEY = "tenant-menu-collapsed";

export function useTenantMenuCollapsed(defaultValue = true) {
  const [collapsed, setCollapsed] = useState(defaultValue);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored === null) {
      setCollapsed(true);
      return;
    }

    setCollapsed(stored === "true");
  }, []);

  function toggleCollapsed(): void {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  return {
    collapsed,
    setCollapsed,
    toggleCollapsed,
  };
}