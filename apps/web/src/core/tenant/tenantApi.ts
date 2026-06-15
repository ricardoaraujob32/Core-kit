// apps/web/src/core/tenant/tenantApi.ts

import { httpClient } from "../api/httpClient";
import type { ObterConfiguracaoAtivaLocatarioResponse } from "./tipos";

export async function getTenantConfiguracaoAtiva(): Promise<ObterConfiguracaoAtivaLocatarioResponse> {
  return httpClient.get<ObterConfiguracaoAtivaLocatarioResponse>(
    "/me/locatario/configuracoes/ativa",
  );
}
