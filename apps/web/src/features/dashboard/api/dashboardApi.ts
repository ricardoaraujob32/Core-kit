// apps/web/src/features/dashboard/api/dashboardApi.ts

import { httpClient } from "../../../core/api/httpClient";
import type { DashboardResumoResponse } from "../tipos";

export async function obterDashboardResumo() {
  return httpClient.get<DashboardResumoResponse>(
    "/dashboard/resumo",
  );
}