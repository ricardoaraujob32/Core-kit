// packages/core/src/tokens/tipos.ts

import { wrapOk, type Result } from "../result";
import type { ErroApp } from "../erros";
import { createErroApp } from "../ROPHelpers";
import { LocatarioId } from "../locatario";
import { UsuarioId } from "../usuarios";

/**
 * Tokens de atualização (refresh tokens) para autenticação.
 * Importante: o token em claro NUNCA é persistido. Somente hash_token.
 *
 * Baseado em tokens.sql:
 * - id (UUID)
 * - usuario_id (UUID)
 * - locatario_id (UUID | null)
 * - hash_token (TEXT)
 * - emitido_em, expira_em, revogado_em
 * - proximo_token_id (UUID | null)
 * - agente_usuario, endereco_ip
 */

/**
 * 
 */
export type TokenId = string & { readonly __brand: "TokenId" };

/**
 * 
 */
export type Token = {
  id: TokenId;
  usuarioId: UsuarioId;
  locatarioId: LocatarioId | null;
  hashToken: string;
  emitidoEm: Date;
  expiraEm: Date;
  revogadoEm: Date | null;
  proximoTokenId: TokenId | null; //id do novo token gerado por rotação. Se preenchido, em geral o token atual deve ser considerado encerrado/substituído.
  agenteUsuario: string | null;
  enderecoIp: string | null;
};

/**
 * 
 */
export type CriarTokenParams = {
  id: TokenId;
  usuarioId: UsuarioId;
  locatarioId?: LocatarioId | null;
  hashToken: string;
  emitidoEm: Date;
  expiraEm: Date;
  revogadoEm?: Date | null;
  proximoTokenId?: TokenId | null;
  agenteUsuario?: string | null;
  enderecoIp?: string | null;
};

/**
 * 
 * @param params 
 * @returns 
 */
export function criarToken(params: CriarTokenParams): Result<Token, ErroApp> {
  if (!params.id || typeof params.id !== "string") {
    return createErroApp({ codigo: "INVALIDO", mensagem: "TokenId inválido." });
  }
  if (!params.usuarioId || typeof params.usuarioId !== "string") {
    return createErroApp({ codigo: "INVALIDO", mensagem: "UsuarioId inválido." });
  }
  if (params.locatarioId !== null && params.locatarioId !== undefined && typeof params.locatarioId !== "string") {
    return createErroApp({ codigo: "INVALIDO", mensagem: "LocatarioId inválido." });
  }
  if (typeof params.hashToken !== "string" || params.hashToken.trim().length === 0) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "hashToken é obrigatório." });
  }
  if (!(params.emitidoEm instanceof Date) || Number.isNaN(params.emitidoEm.getTime())) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "emitidoEm inválido." });
  }
  if (!(params.expiraEm instanceof Date) || Number.isNaN(params.expiraEm.getTime())) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "expiraEm inválido." });
  }
  if (params.expiraEm.getTime() <= params.emitidoEm.getTime()) {
    return createErroApp({ codigo: "INVALIDO", mensagem: "expiraEm deve ser maior que emitidoEm." });
  }

  return wrapOk( {
      id: params.id,
      usuarioId: params.usuarioId,
      locatarioId: params.locatarioId ?? null,
      hashToken: params.hashToken,
      emitidoEm: params.emitidoEm,
      expiraEm: params.expiraEm,
      revogadoEm: params.revogadoEm ?? null,
      proximoTokenId: params.proximoTokenId ?? null,
      agenteUsuario: params.agenteUsuario ?? null,
      enderecoIp: params.enderecoIp ?? null,
    } );
}

/**
 * 
 * @param token 
 * @param agora 
 * @returns 
 */
export function tokenEstaExpirado(token: Token, agora: Date): boolean {
  return token.expiraEm.getTime() <= agora.getTime();
}

/**
 * 
 * @param token 
 * @returns 
 */
export function tokenEstaRevogado(token: Token): boolean {
  return token.revogadoEm !== null;
}

/**
 * 
 * @param token 
 * @param agora 
 * @returns 
 */
export function tokenEstaAtivo(token: Token, agora: Date): boolean {
  return !tokenEstaRevogado(token) && !tokenEstaExpirado(token, agora);
}