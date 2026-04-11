// frontend/src/core/tenant/tenantApi.ts

import { httpClient } from "../api/httpClient";
import type { TenantBranding } from "./tipos";

export type GetTenantBrandingResponse = {
  branding: TenantBranding;
};

export async function getTenantBranding(
  locatarioId: string,
): Promise<GetTenantBrandingResponse> {
  return httpClient.get<GetTenantBrandingResponse>(
    `/locatarios/${locatarioId}/branding`,
  );
}