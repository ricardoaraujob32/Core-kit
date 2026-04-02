// apps/api/src/modules/auth/auth.dto.ts

import { LocatarioId, LocatarioSlug } from "@core-kit/core";

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
