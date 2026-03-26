// apps/api/src/tipos/fastify-context.d.ts

import "fastify";
import type { LocatarioId, Papel, Permissao, UsuarioId } from "@core-kit/core";

/**
 * Estrutura do principal autenticado anexado à requisição Fastify.
 *
 * Este objeto é preenchido pelo `authGuard` após validação da sessão.
 *
 * Campos:
 * - `usuarioId`: identidade do usuário autenticado;
 * - `locatarioId`: escopo do locatário da sessão;
 * - `papeis`: papéis resolvidos ou placeholders locais;
 * - `permissoes`: permissões resolvidas ou placeholders locais;
 * - `sessionId`: identificador lógico da sessão validada;
 * - `expiraEm`: instante de expiração da sessão.
 */
export interface UsuarioAutenticado {
  usuarioId: UsuarioId;
  locatarioId?: LocatarioId | null;
  papeis: Papel[];
  permissoes: Permissao[];
  sessionId?: string;
  expiraEm?: Date;
}

/**
 * Expansão do FastifyRequest para incluir:
 * - `requestIdApp`: identificador interno da requisição;
 * - `usuario`: principal autenticado propagado pelo middleware de auth.
 */
declare module "fastify" {
  interface FastifyRequest {
    requestIdApp: string;
    usuario?: UsuarioAutenticado;
  }
}
