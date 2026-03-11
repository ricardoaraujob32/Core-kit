import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { UsuarioId } from "../usuarios";
import { TokenId, TokenPersistido } from "./tipos";

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
}

/**
 * 
 */
export interface CriptoTokensPorta {
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>;
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
}

/**
 * 
 */
export interface IdPorta {
  gerarId(): string;
}
