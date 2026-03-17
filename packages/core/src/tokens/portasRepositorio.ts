// packages/core/src/tokens/portasRepositorio.ts

import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { UsuarioId } from "../usuarios";
import { TokenId, TokenPersistido, TokenTipo } from "./tipos";

/**
 * 
 */
export interface TokensRepositorio {
  inserir(token: TokenPersistido): Promise<Result<void, ErroApp>>;

  buscarPorHash(params: {locatarioId: LocatarioId; hashToken: string;}): Promise<Result<TokenPersistido | null, ErroApp>>;

  buscarPorId(params: {locatarioId: LocatarioId; tokenId: TokenId;}): Promise<Result<TokenPersistido | null, ErroApp>>;

  revogar(params: {
    locatarioId: LocatarioId;
    tokenId: TokenId;
    revogadoPor: string;
    revogadoEm: Date;
    motivo?: string;
  }): Promise<Result<void, ErroApp>>;

  encadearRotacao?(params: {
    locatarioId: LocatarioId;
    tokenAntigoId: TokenId;
    tokenAntigoUsuarioId: UsuarioId;
    tokenNovoId: TokenId;
    tokenNovoUsuarioId: UsuarioId;
  }): Promise<Result<void, ErroApp>>;

  criar(params: {
    tokenId: TokenId;
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
    hashToken: string;
    tipo: TokenTipo;
    emitidoEm: Date;
    expiraEm: Date;
    revogadoEm: Date | null;
    proximoTokenId: TokenId | null;
    agenteUsuario: string | null;
    enderecoIp: string | null;
  }): Promise<Result<{ tokenId: TokenId }, ErroApp>>;

  atualizar(token: TokenPersistido): Promise<Result<TokenPersistido, ErroApp>>;

  buscarPorId(params: {
    tokenId: TokenId;
  }): Promise<Result<TokenPersistido | null, ErroApp>>;

  buscarPorHash(params: {
    hashToken: string;
  }): Promise<Result<TokenPersistido | null, ErroApp>>;

  listarPorUsuario(params: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
  }): Promise<Result<TokenPersistido[], ErroApp>>;
}

/**
 * 
 */
export interface TokensServicePorta {
  criarRefresh(params: { locatarioId: LocatarioId; usuarioId: UsuarioId; agora: Date; ttlMs: number })
    : Promise<Result<{ tokenBruto: string; tokenId: TokenId; expiraEm: Date }, ErroApp>>;

  validarRefresh(params: { locatarioId: LocatarioId; tokenBruto: string; agora: Date })
    : Promise<Result<{ tokenId: TokenId; usuarioId: UsuarioId; expiraEm: Date }, ErroApp>>;

  revogar(params: { locatarioId: LocatarioId; tokenId: TokenId; usuarioId: UsuarioId; agora: Date; motivo?: string })
    : Promise<Result<void, ErroApp>>;

  // opcional: encadearRotacao...
}

/**
 * 
 */
export interface CriptoTokensPorta {
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>;
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
}
