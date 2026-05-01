// apps/web/src/features/superadmin/locatarios/api/locatariosApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import { AtualizarConfiguracaoLocatarioInput, CriarConfiguracaoLocatarioInput } from "../../../tenant-admin/locatario";
import type { AcaoLocatarioResponse, AtualizarLocatarioInput, AtualizarLocatarioResponse, CriarLocatarioInput, CriarLocatarioResponse, EncerrarLocatarioInput,
  ListarLocatariosResponse, ObterLocatarioResponse, ReativarLocatarioInput, SuspenderLocatarioInput } from "../tipos";

const BASE_PLATAFORMA = "/plataforma/locatarios";
const BASE = "/locatarios";
const BASE_ME = "/me/locatario";

export const locatariosApi = {
  listar(): Promise<ListarLocatariosResponse> {
    return httpClient.get<ListarLocatariosResponse>(BASE_PLATAFORMA);
  },

  obter(locatarioId: string): Promise<ObterLocatarioResponse> {
    return httpClient.get<ObterLocatarioResponse>(`${BASE_PLATAFORMA}/${locatarioId}`);
  },

  criar(input: CriarLocatarioInput): Promise<CriarLocatarioResponse> {
    return httpClient.post<CriarLocatarioResponse, CriarLocatarioInput>(
      BASE_PLATAFORMA,
      input,
    );
  },

  atualizar(locatarioId: string, input: AtualizarLocatarioInput): Promise<AtualizarLocatarioResponse> {
    return httpClient.patch<AtualizarLocatarioResponse, AtualizarLocatarioInput>(
      `${BASE_PLATAFORMA}/${locatarioId}`,
      input,
    );
  },

  suspender(locatarioId: string, input: SuspenderLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, SuspenderLocatarioInput>(
      `${BASE_PLATAFORMA}/${locatarioId}/suspender`,
      input,
    );
  },

  reativar(locatarioId: string, input: ReativarLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, ReativarLocatarioInput>(
      `${BASE_PLATAFORMA}/${locatarioId}/reativar`,
      input,
    );
  },

  encerrar(locatarioId: string, input: EncerrarLocatarioInput = {}): Promise<AcaoLocatarioResponse> {
    return httpClient.post<AcaoLocatarioResponse, EncerrarLocatarioInput>(
      `${BASE_PLATAFORMA}/${locatarioId}/encerrar`,
      input,
    );
  },

  // próprio locatário
  obterMeu(): Promise<ObterLocatarioResponse> {
    // o backend ignora o :id e usa ctx.locatarioId
    return httpClient.get(`${BASE}/me`);
  },

  // 👇 CONFIGURAÇÕES (NOVO CONTRATO)
  listarConfiguracoes() {
    return httpClient.get(`${BASE_ME}/configuracoes`);
  },

  obterConfiguracaoAtiva() {
    return httpClient.get(`${BASE_ME}/configuracoes/ativa`);
  },

  criarConfiguracao(input: CriarConfiguracaoLocatarioInput) {
    return httpClient.post(`${BASE_ME}/configuracoes`, input);
  },

  atualizarConfiguracao(configuracaoId: string, input: AtualizarConfiguracaoLocatarioInput) {
    return httpClient.patch(
      `${BASE_ME}/configuracoes/${configuracaoId}`,
      input,
    );
  },

  ativarConfiguracao(configuracaoId: string) {
    return httpClient.post(
      `${BASE_ME}/configuracoes/${configuracaoId}/ativar`,
    );
  },
};
