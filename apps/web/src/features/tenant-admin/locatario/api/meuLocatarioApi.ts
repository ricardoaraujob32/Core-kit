// apps/web/src/features/tenant-admin/locatario/api/meuLocatarioApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AtualizarConfiguracaoLocatarioInput, AtualizarConfiguracaoLocatarioResponse, AtivarConfiguracaoLocatarioResponse, CriarConfiguracaoLocatarioInput,
  CriarConfiguracaoLocatarioResponse, ListarConfiguracoesLocatarioResponse, ObterConfiguracaoAtivaLocatarioResponse, ObterMeuLocatarioResponse } from "../tipos";

export const meuLocatarioApi = {
  obterMeuLocatario(locatarioId: string): Promise<ObterMeuLocatarioResponse> {
    return httpClient.get<ObterMeuLocatarioResponse>(`/locatarios/${locatarioId}`);
  },

  listarConfiguracoes(locatarioId: string): Promise<ListarConfiguracoesLocatarioResponse> {
    return httpClient.get<ListarConfiguracoesLocatarioResponse>(
      `/locatarios/${locatarioId}/configuracoes`,
    );
  },

  obterConfiguracaoAtiva(locatarioId: string): Promise<ObterConfiguracaoAtivaLocatarioResponse> {
    return httpClient.get<ObterConfiguracaoAtivaLocatarioResponse>(
      `/locatarios/${locatarioId}/configuracoes/ativa`,
    );
  },

  criarConfiguracao(locatarioId: string, input: CriarConfiguracaoLocatarioInput): Promise<CriarConfiguracaoLocatarioResponse> {
    return httpClient.post<
      CriarConfiguracaoLocatarioResponse,
      CriarConfiguracaoLocatarioInput
    >(`/locatarios/${locatarioId}/configuracoes`, input);
  },

  atualizarConfiguracao(locatarioId: string, configuracaoId: string, input: AtualizarConfiguracaoLocatarioInput): Promise<AtualizarConfiguracaoLocatarioResponse> {
    return httpClient.patch<
      AtualizarConfiguracaoLocatarioResponse,
      AtualizarConfiguracaoLocatarioInput
    >(`/locatarios/${locatarioId}/configuracoes/${configuracaoId}`, input);
  },

  ativarConfiguracao(locatarioId: string, configuracaoId: string): Promise<AtivarConfiguracaoLocatarioResponse> {
    return httpClient.post<AtivarConfiguracaoLocatarioResponse>(
      `/locatarios/${locatarioId}/configuracoes/${configuracaoId}/ativar`,
    );
  },
};
