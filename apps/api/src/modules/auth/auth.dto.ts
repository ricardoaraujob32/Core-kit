// apps/api/src/modules/auth/auth.dto.ts

import { LocatarioId, LocatarioSlug, ModuloCodigo, Papel, Permissao, UsuarioId } from "@core-kit/core";

/**
 * Payload HTTP esperado no endpoint de login.
 *
 * Campos:
 * - `locatarioId`: escopo do login;
 * - `email`: credencial do usuário;
 * - `senha`: segredo em texto puro recebido da borda.
 */
export type LoginBody = {
  locatarioSlug: LocatarioSlug;
  email: string;
  senha: string;
};

/**
 * Resposta do login.
 */
export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

/**
 * Payload HTTP esperado no endpoint de refresh.
 *
 * Campos:
 * - `locatarioId`: locatário esperado para o refresh;
 * - `refreshToken`: token bruto enviado pelo cliente.
 */
export type RefreshBody = {
  locatarioId: LocatarioId;
  refreshToken: string;
};

/**
 * Resposta do refresh.
 */
export type RefreshResponse = {
  accessToken: string;
  refreshToken?: string;
};

/**
 * Payload HTTP esperado no endpoint de logout.
 *
 * Observação:
 * - o contrato atual de logout usa o refresh token bruto;
 * - isso combina com o modelo atual de revogação persistida.
 */
export type LogoutBody = {
  locatarioId: LocatarioId;
  refreshToken: string;
};

/**
 * Usuário de sessão serializado para o frontend.
 */
export type SessionUserDto = {
  usuarioId: UsuarioId;
  locatarioId: string;
  papeis: Papel[];
  permissoes: Permissao[];
  modulosHabilitados: ModuloCodigo[];
  isSuperAdmin: boolean;
};

/**
 * Resposta do endpoint `auth/me`.
 */
export type MeResponse = {
  usuario: SessionUserDto;
};

