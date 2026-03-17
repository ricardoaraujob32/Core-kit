// packages/core/src/tokens/tipos.ts

import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { UsuarioId } from "../usuarios";

export type TokenId = string;

export type TokenTipo = "ACESSO" | "REFRESH" | "RECUPERACAO_SENHA" | "CONFIRMACAO_EMAIL";

export type TokenPersistido = {
  tokenId: TokenId;
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  tipo: TokenTipo;
  hashToken: string;
  emitidoEm: Date;
  expiraEm: Date;
  revogadoEm: Date | null;
  proximoTokenId?: TokenId | null;       // opcional (rotação)
  proximoUsuarioId?: UsuarioId | null;      // opcional (rotação)
  agenteUsuario: string | null;
  enderecoIp: string | null;
};

export type CriarRefreshInput = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  agora: Date;
  ttlMs: number; // 14 dias (decisão)
};

export interface EmitirTokenInput {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId;
  hashToken: string;
  tipo: TokenTipo;
  expiraEm: Date;
  agenteUsuario?: string | null;
  enderecoIp?: string | null;
}

export interface EmitirTokenOutput {
  tokenId: TokenId;
}

export interface ObterTokenPorHashInput {
  hashToken: string;
}

export type RevogarTokenInput = {
  locatarioId: LocatarioId;
  tokenId: TokenId;
  usuarioId: UsuarioId; // quem está revogando (para auditoria)
  agora: Date;
  motivo?: string;
};

export type RefreshCriado = {
  tokenBruto: string;   // retorna para o caller (somente uma vez)
  tokenId: TokenId;
  expiraEm: Date;
};

export type ValidarRefreshInput = {
  locatarioId: LocatarioId;
  tokenBruto: string;
  agora: Date;
};

export type RefreshValido = {
  tokenId: TokenId;
  usuarioId: UsuarioId;
  expiraEm: Date;
};

export interface RotacionarTokenInput {
  tokenId: TokenId;
  novoHashToken: string;
  novoExpiraEm: Date;
  agenteUsuario?: string | null;
  enderecoIp?: string | null;
}

export interface ListarTokensDoUsuarioInput {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId;
}

export interface ListarTokensDoUsuarioOutput {
  itens: TokenPersistido[];
}

export type ResultadoCriarRefresh = Promise< Result<RefreshCriado, ErroApp> >;

export type ResultadoValidarRefresh = Promise< Result<RefreshValido, ErroApp> >;

export type ResultadoRevogarToken = Result<TokenPersistido, ErroApp>

export type ResultadoEmitirToken = Promise< Result<EmitirTokenOutput, ErroApp> >;

export type ResultadoObterTokenPorHash = Promise< Result<TokenPersistido, ErroApp> >;

export type ResultadoRotacionarToken = Promise< Result<{ tokenAnterior: TokenPersistido; tokenNovo: TokenPersistido }, ErroApp> >;

export type ResultadoListarTokensDoUsuario = Promise< Result<ListarTokensDoUsuarioOutput, ErroApp> >;
