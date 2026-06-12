// packages/core/src/tokens/politicas.ts

import type { Result, ErroApp } from "../kernel/index.js";
import type { LocatarioId } from "../locatarios/index.js";
import type { UsuarioId } from "../usuarios/index.js";
import type { TokenId, TokenPersistido } from "./tipos.js";

export type OperacaoPoliticaToken =
  | "TOKEN_EMITIR"
  | "TOKEN_LISTAR"
  | "TOKEN_OBTER_POR_HASH"
  | "TOKEN_REVOGAR"
  | "TOKEN_ROTACIONAR";

export type EntradaPoliticaToken = {
  operacao: OperacaoPoliticaToken;
  locatarioId?: LocatarioId | null;
  usuarioId?: UsuarioId | null;
  tokenId?: TokenId | null;
  token?: TokenPersistido | null;
  dados?: Record<string, unknown>;
};

export type PoliticaSegurancaTokensPorta = {
  autorizar(input: EntradaPoliticaToken): Promise<Result<void, ErroApp>>;
};

export type DepsPoliticaSegurancaTokens = {
  politicaSeguranca?: PoliticaSegurancaTokensPorta;
};

export async function autorizarToken(deps: DepsPoliticaSegurancaTokens, input: EntradaPoliticaToken): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(input);
}