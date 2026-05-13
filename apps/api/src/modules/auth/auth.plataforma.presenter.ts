// apps/api/src/modules/auth/auth.plataforma.presenter.ts

import { UsuarioId } from "@core-kit/core";
import type { LoginPlataformaResponseDto, UsuarioSessaoPlataformaDto } from "./auth.plataforma.dto";

export type SessaoPlataformaPresenterInput = {
  accessToken: string;
  accessExpiraEm: Date | string;
  usuarioId: UsuarioId;
};

export function serializarUsuarioSessaoPlataforma(usuarioId: UsuarioId): UsuarioSessaoPlataformaDto {
  return {
    usuarioId,
    locatarioId: null,
    perfil: "PLATAFORMA",
  };
}

/**
 * Serializa a sessão de plataforma para a borda HTTP.
 *
 * O presenter é intencionalmente restritivo para impedir vazamento futuro de:
 * - refresh token;
 * - permissões;
 * - papéis;
 * - módulos habilitados.
 */
export function serializarSessaoPlataforma(input: SessaoPlataformaPresenterInput): LoginPlataformaResponseDto {
  return {
    accessToken: input.accessToken,
    accessExpiraEm: input.accessExpiraEm instanceof Date
      ? input.accessExpiraEm.toISOString()
      : input.accessExpiraEm,
    usuario: serializarUsuarioSessaoPlataforma(input.usuarioId),
  };
}
