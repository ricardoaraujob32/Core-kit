// apps/web/src/features/dashboard/hooks/useDashboardResumo.ts

import { useEffect, useState } from "react";
import { DashboardResumo } from "../tipos";
import { obterDashboardResumo } from "../api/dashboardApi";

export function useDashboardResumo() {
  const [item, setItem] = useState<DashboardResumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obterDashboardResumo()
      .then((response) => setItem(response.item))
      .finally(() => setLoading(false));
  }, []);

  return {
    item,
    loading,
  };
}