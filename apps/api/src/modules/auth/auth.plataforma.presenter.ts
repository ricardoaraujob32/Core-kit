// apps/api/src/modules/auth/auth.plataforma.presenter.ts

import type { LoginPlataformaResponseDto, UsuarioSessaoPlataformaDto } from "./auth.plataforma.dto.js";
import type { UsuarioId } from "@core-kit/core";

export function toUsuarioSessaoPlataformaDto(usuarioId: UsuarioId): UsuarioSessaoPlataformaDto {
  return {
    usuarioId,
    locatarioId: null,
    perfil: "PLATAFORMA",
  };
}

export function toLoginPlataformaResponseDto(params: {
  accessToken: string;
  refreshToken: string;
  accessExpiraEm: Date | string;
  refreshExpiraEm: Date | string;
  usuarioId: UsuarioId;
}): LoginPlataformaResponseDto {
  return {
    accessToken: params.accessToken,
    refreshToken: params.refreshToken,
    accessExpiraEm: params.accessExpiraEm instanceof Date ? params.accessExpiraEm.toISOString() : params.accessExpiraEm,
    refreshExpiraEm: params.refreshExpiraEm instanceof Date ? params.refreshExpiraEm.toISOString() : params.refreshExpiraEm,
    usuario: toUsuarioSessaoPlataformaDto(params.usuarioId),
  };
}

export function serializarSessaoPlataforma(params: {
  accessToken: string;
  refreshToken?: string;
  accessExpiraEm: Date | string;
  refreshExpiraEm?: Date | string;
  usuarioId: UsuarioId;
}): LoginPlataformaResponseDto {
  return toLoginPlataformaResponseDto({
    accessToken: params.accessToken,
    refreshToken: params.refreshToken ?? "",
    accessExpiraEm: params.accessExpiraEm,
    refreshExpiraEm: params.refreshExpiraEm ?? "",
    usuarioId: params.usuarioId,
  });
}
