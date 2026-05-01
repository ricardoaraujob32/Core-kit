// apps/web/src/features/tenant-admin/locatario/api/meuLocatarioApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AtualizarConfiguracaoLocatarioInput, AtualizarConfiguracaoLocatarioResponse, AtivarConfiguracaoLocatarioResponse, CriarConfiguracaoLocatarioInput,
  CriarConfiguracaoLocatarioResponse, ListarConfiguracoesLocatarioResponse, ObterConfiguracaoAtivaLocatarioResponse, ObterMeuLocatarioResponse } from "../tipos";

const BASE_ME = "/me/locatario";
const BASE_LOCATARIOS = "/locatarios";

export const meuLocatarioApi = {
  obterMeuLocatario(locatarioId: string): Promise<ObterMeuLocatarioResponse> {
    return httpClient.get<ObterMeuLocatarioResponse>(
      `${BASE_LOCATARIOS}/${locatarioId}`,
    );
  },

  listarConfiguracoes(): Promise<ListarConfiguracoesLocatarioResponse> {
    return httpClient.get<ListarConfiguracoesLocatarioResponse>(
      `${BASE_ME}/configuracoes`,
    );
  },

  obterConfiguracaoAtiva(): Promise<ObterConfiguracaoAtivaLocatarioResponse> {
    return httpClient.get<ObterConfiguracaoAtivaLocatarioResponse>(
      `${BASE_ME}/configuracoes/ativa`,
    );
  },

  criarConfiguracao(input: CriarConfiguracaoLocatarioInput): Promise<CriarConfiguracaoLocatarioResponse> {
    return httpClient.post<CriarConfiguracaoLocatarioResponse, CriarConfiguracaoLocatarioInput>(
      `${BASE_ME}/configuracoes`, input
    );
  },

  atualizarConfiguracao(configuracaoId: string, input: AtualizarConfiguracaoLocatarioInput): Promise<AtualizarConfiguracaoLocatarioResponse> {
    return httpClient.patch<AtualizarConfiguracaoLocatarioResponse, AtualizarConfiguracaoLocatarioInput>(
      `${BASE_ME}/configuracoes/${configuracaoId}`, input
    );
  },

  ativarConfiguracao(configuracaoId: string): Promise<AtivarConfiguracaoLocatarioResponse> {
    return httpClient.post<AtivarConfiguracaoLocatarioResponse>(
      `${BASE_ME}/configuracoes/${configuracaoId}/ativar`,
    );
  },
};
