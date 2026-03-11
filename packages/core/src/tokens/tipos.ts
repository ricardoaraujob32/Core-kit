import { ErroApp } from "../erros";
import { LocatarioId } from "../locatarios/tipos";
import { Result } from "../result";
import { UsuarioId } from "../usuarios";

export type TokenId = string;

export type TokenTipo = "REFRESH" | "RECUPERACAO_SENHA" | "CONFIRMACAO_EMAIL";

export type TokenPersistido = {
  tokenId: TokenId;
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  tipo: TokenTipo;
  hashToken: string;
  expiraEm: Date;
  revogadoEm: Date | null;
  criadoEm: Date;
  proximoTokenId?: TokenId | null;       // opcional (rotação)
  proximoUsuarioId?: UsuarioId | null;      // opcional (rotação)
};

export type CriarRefreshInput = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  agora: Date;
  ttlMs: number; // 14 dias (decisão)
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

export type RevogarTokenInput = {
  locatarioId: LocatarioId;
  tokenId: TokenId;
  usuarioId: UsuarioId; // quem está revogando (para auditoria)
  agora: Date;
  motivo?: string;
};

export type ResultadoCriarRefresh = Promise<
  Result<RefreshCriado, ErroApp>
>;

export type ResultadoValidarRefresh = Promise<
  Result<RefreshValido, ErroApp>
>;

export type ResultadoRevogarToken = Promise<Result<void, ErroApp>>;
