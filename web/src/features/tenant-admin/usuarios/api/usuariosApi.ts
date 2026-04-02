
import { httpClient } from "../../../../core/api/httpClient";
import type {
  AcaoUsuarioResponse,
  AtualizarUsuarioInput,
  AtualizarUsuarioResponse,
  CriarUsuarioInput,
  CriarUsuarioResponse,
  ListarUsuariosResponse,
  ObterUsuarioResponse,
} from "../types";

const BASE = "/api/usuarios";

export const usuariosApi = {
  async listar(): Promise<ListarUsuariosResponse> {
    const { data } = await httpClient.get<ListarUsuariosResponse>(BASE);
    return data;
  },

  async obter(usuarioId: string): Promise<ObterUsuarioResponse> {
    const { data } = await httpClient.get<ObterUsuarioResponse>(`${BASE}/${usuarioId}`);
    return data;
  },

  async criar(input: CriarUsuarioInput): Promise<CriarUsuarioResponse> {
    const { data } = await httpClient.post<CriarUsuarioResponse>(BASE, input);
    return data;
  },

  async atualizar(usuarioId: string, input: AtualizarUsuarioInput): Promise<AtualizarUsuarioResponse> {
    const { data } = await httpClient.patch<AtualizarUsuarioResponse>(`${BASE}/${usuarioId}`, input);
    return data;
  },

  async inativar(usuarioId: string): Promise<AcaoUsuarioResponse> {
    const { data } = await httpClient.post<AcaoUsuarioResponse>(`${BASE}/${usuarioId}/inativar`);
    return data;
  },

  async reativar(usuarioId: string): Promise<AcaoUsuarioResponse> {
    const { data } = await httpClient.post<AcaoUsuarioResponse>(`${BASE}/${usuarioId}/reativar`);
    return data;
  },
};
