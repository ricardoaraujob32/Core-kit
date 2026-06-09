// apps/web/src/features/superadmin/locatarios/api/usuariosLocatarioApi.ts

import { httpClient } from "../../../../core/api/httpClient";
import type {
  CriarUsuarioInput,
  CriarUsuarioResponse,
} from "../../../tenant-admin/usuarios";

export type UsuarioLocatario = {
  usuarioId: string;
  locatarioId: string;
  nome: string;
  email: string;
  perfil?: string | null;
  status?: string | null;
  criadoEm?: string | null;
  atualizadoEm?: string | null;
  excluidoEm?: string | null;
};

export type ListarUsuariosLocatarioResponse = {
  itens: UsuarioLocatario[];
};

export const usuariosLocatarioApi = {
  listar(locatarioId: string): Promise<ListarUsuariosLocatarioResponse> {
    return httpClient.get<ListarUsuariosLocatarioResponse>(
      `/plataforma/locatarios/${locatarioId}/usuarios`,
    );
  },

  criar(
    locatarioId: string,
    input: CriarUsuarioInput,
  ): Promise<CriarUsuarioResponse> {
    return httpClient.post<CriarUsuarioResponse, CriarUsuarioInput>(
      `/plataforma/locatarios/${locatarioId}/usuarios`,
      input,
    );
  },
};
