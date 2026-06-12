// apps/web/src/features/tenant-admin/assinatura/api/assinaturaModulosApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { DesvincularModuloAssinaturaResponse, ListarMeusModulosAssinaturaResponse, VincularModuloAssinaturaInput, VincularModuloAssinaturaResponse } from "../tipos";

const BASE = "/me/assinatura/modulos";

export const assinaturaModulosApi = {
  listar(): Promise<ListarMeusModulosAssinaturaResponse> {
    return httpClient.get<ListarMeusModulosAssinaturaResponse>(BASE);
  },

  vincular(
    input: VincularModuloAssinaturaInput,
  ): Promise<VincularModuloAssinaturaResponse> {
    return httpClient.post<
      VincularModuloAssinaturaResponse,
      VincularModuloAssinaturaInput
    >(BASE, input);
  },

  desvincular(moduloId: string): Promise<DesvincularModuloAssinaturaResponse> {
    return httpClient.delete<DesvincularModuloAssinaturaResponse>(
      `${BASE}/${moduloId}`,
    );
  },
};