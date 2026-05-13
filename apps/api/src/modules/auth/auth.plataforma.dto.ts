// apps/api/src/modules/auth/auth.plataforma.dto.ts

import { UsuarioId } from "@core-kit/core";
import { z } from "zod";

export const loginPlataformaBodySchema = z.object({
  email: z.string().trim().email(),
  senha: z.string().min(1),
});

export type LoginPlataformaBodyDto = z.infer<typeof loginPlataformaBodySchema>;

export function parseLoginPlataformaBody(input: unknown) {
  return loginPlataformaBodySchema.safeParse(input);
}

/**
 * Usuário serializado para sessão de plataforma.
 *
 * Este DTO é propositalmente mínimo: não inclui papéis, permissões nem módulos.
 */
export type UsuarioSessaoPlataformaDto = {
  usuarioId: UsuarioId;
  locatarioId: null;
  perfil: "PLATAFORMA";
};

/**
 * Resposta HTTP oficial de `POST /api/auth/plataforma/login`.
 *
 * Regras de segurança:
 * - não retorna `refreshToken`;
 * - não retorna `refreshExpiraEm`;
 * - não retorna permissões;
 * - não retorna papéis;
 * - não retorna módulos.
 */
export type LoginPlataformaResponseDto = {
  accessToken: string;
  accessExpiraEm: Date | string;
  usuario: UsuarioSessaoPlataformaDto;
};