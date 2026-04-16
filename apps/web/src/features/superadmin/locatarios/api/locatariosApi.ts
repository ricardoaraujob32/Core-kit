// apps/web/src/features/superadmin/locatarios/api/locatariosApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AcaoLocatarioResponse, AtualizarLocatarioInput, AtualizarLocatarioResponse, CriarLocatarioInput, CriarLocatarioResponse, EncerrarLocatarioInput,
  ListarLocatariosResponse, ObterLocatarioResponse, ReativarLocatarioInput, SuspenderLocatarioInput } from "../tipos";

const BASE = "/plataforma/locatarios";

export const locatariosApi = {
  listar(): Promise<ListarLocatariosResponse> {
    return httpClient.get<ListarLocatariosResponse>(BASE);
  },

  obter(locatarioId: string): Promise<ObterLocatarioResponse> {
    return httpClient.get<ObterLocatarioResponse>(`${BASE}/${locatarioId}`);
  },

  criar(input: CriarLocatarioInput): Promise<CriarLocatarioResponse> {
    return httpClient.post<CriarLocatarioResponse, CriarLocatarioInput>(
      BASE,
      input,
    );
  },

  atualizar(locatarioId: string, input: AtualizarLocatarioInput): Promise<AtualizarLocatarioResponse> {
    return httpClient.patch<AtualizarLocatarioResponse, AtualizarLocatarioInput>(
      `${BASE}/${locatarioId}`,
      input,
    );
  },

  suspender(locatarioId: string, input: SuspenderLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, SuspenderLocatarioInput>(
      `${BASE}/${locatarioId}/suspender`,
      input,
    );
  },

  reativar(locatarioId: string, input: ReativarLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, ReativarLocatarioInput>(
      `${BASE}/${locatarioId}/reativar`,
      input,
    );
  },

  encerrar(locatarioId: string, input: EncerrarLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, EncerrarLocatarioInput>(
      `${BASE}/${locatarioId}/encerrar`,
      input,
    );
  },
};
