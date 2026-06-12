// apps/web/src/features/tenant-admin/usuarios/api/usuariosApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type { AcaoUsuarioResponse, AlterarMinhaSenhaInput, AlterarSenhaUsuarioResponse, AtualizarUsuarioInput, AtualizarUsuarioResponse, CriarUsuarioInput, 
  CriarUsuarioResponse, ListarUsuariosResponse, ObterUsuarioResponse, RedefinirSenhaUsuarioInput, RedefinirSenhaUsuarioResponse } from "../tipos";

const BASE = "/usuarios";

/**
 * 
 */
export const usuariosApi = {
  listar(): Promise<ListarUsuariosResponse> {
    return httpClient.get<ListarUsuariosResponse>(BASE);
  },

  obter(usuarioId: string): Promise<ObterUsuarioResponse> {
    return httpClient.get<ObterUsuarioResponse>(`${BASE}/${usuarioId}`);
  },

  criar(input: CriarUsuarioInput): Promise<CriarUsuarioResponse> {
    return httpClient.post<CriarUsuarioResponse, CriarUsuarioInput>(BASE, input);
  },

  atualizar(usuarioId: string, input: AtualizarUsuarioInput): Promise<AtualizarUsuarioResponse> {
    return httpClient.patch<AtualizarUsuarioResponse, AtualizarUsuarioInput>(`${BASE}/${usuarioId}`, input);
  },

  inativar(usuarioId: string): Promise<AcaoUsuarioResponse> {
    return httpClient.post<AcaoUsuarioResponse>(`${BASE}/${usuarioId}/inativar`);
  },

  reativar(usuarioId: string): Promise<AcaoUsuarioResponse> {
    return httpClient.post<AcaoUsuarioResponse>(`${BASE}/${usuarioId}/reativar`);
  },

  alterarMinhaSenha(usuarioId: string, input: AlterarMinhaSenhaInput): Promise<AlterarSenhaUsuarioResponse> {
    return httpClient.post<AlterarSenhaUsuarioResponse, AlterarMinhaSenhaInput>(`${BASE}/${usuarioId}/alterar-senha`, input);
  },

  redefinirSenha(usuarioId: string, input: RedefinirSenhaUsuarioInput): Promise<RedefinirSenhaUsuarioResponse> {
    return httpClient.post<RedefinirSenhaUsuarioResponse, RedefinirSenhaUsuarioInput>(`${BASE}/${usuarioId}/redefinir-senha`, input);
  },
};
