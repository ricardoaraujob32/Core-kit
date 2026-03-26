// packages/core/src/tokens/tipos.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * Identificador lógico de um token persistido.
 */
export type TokenId = string;

/**
 * Tipos oficiais de token reconhecidos pelo domínio.
 *
 * A distinção entre tipos define regras de TTL, persistência e consumo.
 */
export type TokenTipo =
  | "ACESSO"
  | "REFRESH"
  | "RECUPERACAO_SENHA"
  | "CONFIRMACAO_EMAIL";

/**
 * Estado lógico derivado de um token persistido.
 */
export type StatusToken = "ATIVO" | "REVOGADO" | "EXPIRADO";

/**
 * Eventos formais da máquina de estados de tokens.
 */
export type EventoToken = "REVOGAR" | "ROTACIONAR";

/**
 * Representação de um token persistido no domínio.
 *
 * Este contrato modela tokens que precisam ser rastreados pelo backend,
 * especialmente refresh tokens e tokens one-time.
 */
export type TokenPersistido = {
  /** Identificador do registro de token. */
  tokenId: TokenId;
  /** Locatário ao qual o token pertence. */
  locatarioId: LocatarioId;
  /** Usuário titular do token. */
  usuarioId: UsuarioId;
  /** Tipo de token emitido. */
  tipo: TokenTipo;
  /** Hash do token bruto. O valor bruto não deve ser persistido. */
  hashToken: string;
  /** Data/hora de emissão. */
  emitidoEm: Date;
  /** Data/hora de expiração. */
  expiraEm: Date;
  /** Marca de revogação lógica, quando houver. */
  revogadoEm: Date | null;
  /** Próximo token na cadeia de rotação, quando aplicável. */
  proximoTokenId?: TokenId | null;
  /** Usuário associado ao próximo token da cadeia, quando aplicável. */
  proximoUsuarioId?: UsuarioId | null;
  /** User-agent associado à emissão, quando disponível. */
  agenteUsuario: string | null;
  /** Endereço IP associado à emissão, quando disponível. */
  enderecoIp: string | null;
};

/**
 * Entrada para criação de um refresh token novo a partir de regras de domínio.
 *
 * Normalmente usada por serviços internos que precisam calcular validade,
 * gerar token bruto e persistir a versão em hash.
 */
export type CriarRefreshInput = {
  /** Locatário do token. */
  locatarioId: LocatarioId;
  /** Usuário titular do token. */
  usuarioId: UsuarioId;
  /** Relógio materializado da operação. */
  agora: Date;
  /** TTL do refresh em milissegundos. */
  ttlMs: number;
};

/**
 * Dados necessários para persistir a emissão de um token.
 */
export interface EmitirTokenInput {
  /** Usuário titular do token. */
  usuarioId: UsuarioId;
  /** Locatário do token. */
  locatarioId: LocatarioId;
  /** Hash do token bruto a ser armazenado. */
  hashToken: string;
  /** Tipo do token emitido. */
  tipo: TokenTipo;
  /** Data/hora de expiração do token. */
  expiraEm: Date;
  /** User-agent associado à emissão, quando houver. */
  agenteUsuario?: string | null;
  /** Endereço IP associado à emissão, quando houver. */
  enderecoIp?: string | null;
}

/**
 * Saída mínima da persistência de um token emitido.
 */
export interface EmitirTokenOutput {
  /** Identificador atribuído ao token persistido. */
  tokenId: TokenId;
}

/**
 * Resultado assíncrono da emissão/persistência de um token.
 */
export type EmitirTokenResult = Promise<Result<EmitirTokenOutput, ErroApp>>;

/**
 * Entrada para listar tokens de um usuário dentro de um locatário.
 */
export interface ListarTokensDoUsuarioInput {
  /** Usuário alvo da listagem. */
  usuarioId: UsuarioId;
  /** Locatário alvo da listagem. */
  locatarioId: LocatarioId;
}

/**
 * Saída padronizada da listagem de tokens do usuário.
 */
export interface ListarTokensDoUsuarioOutput {
  /** Coleção de tokens encontrados. */
  itens: TokenPersistido[];
}

/**
 * Retorno da listagem de tokens do usuário.
 */
export type ListarTokensDoUsuarioResult = Promise<Result<ListarTokensDoUsuarioOutput, ErroApp>>;

/**
 * Entrada usada para localizar um token persistido pelo hash.
 */
export interface ObterTokenPorHashInput {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  hashToken: string;
}

/**
 * Saída de um token persistido pelo hash.
 */
export interface ObterTokenPorHashOutput {
  token: TokenPersistido;
}

/**
 * Resultado da saída de um token persistido pelo hash.
 */
export type ObterTokenPorHashResult = Promise<Result<ObterTokenPorHashOutput, ErroApp>>;

/**
 * Entrada para revogação explícita de token.
 */
export type RevogarTokenInput = {
  /** Locatário em cujo contexto ocorre a revogação. */
  locatarioId: LocatarioId;
  /** Token a ser revogado. */
  tokenId: TokenId;
  /** Usuário que executa a revogação. */
  usuarioId: UsuarioId;
  /** Instante da revogação. */
  agora: Date;
  /** Motivo textual da revogação, quando informado. */
  motivo?: string;
};

/**
 * Saída da revogação explícita de token.
 */
export interface RevogarTokenOutput {
  token: TokenPersistido;
}

/**
 * Resultado da revogação de um token persistido.
 */
export type RevogarTokenResult = Promise<Result<RevogarTokenOutput, ErroApp>>;


/**
 * Entrada para rotação encadeada de token.
 *
 * A rotação substitui o token anterior por um novo hash/token persistido.
 */
export interface RotacionarTokenInput {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  /** Token atual que será rotacionado. */
  tokenId: TokenId;
  /** Hash do novo token bruto. */
  novoHashToken: string;
  /** Expiração do novo token. */
  novoExpiraEm: Date;
  /** User-agent do novo token, quando disponível. */
  agenteUsuario?: string | null;
  /** Endereço IP do novo token, quando disponível. */
  enderecoIp?: string | null;
}

/**
 * Saída da rotação encadeada de token, com o token novo
 */
export interface RotacionarTokenOutput {
  tokenAnterior: TokenPersistido;
  tokenNovo: TokenPersistido;
}

/**
 * Retorno da rotação de token no formato padronizado
 */
export type RotacionarTokenResult = Promise<Result<RotacionarTokenOutput, ErroApp>>;


/**
 * Resultado material da criação de um refresh token.
 *
 * O `tokenBruto` deve ser entregue ao chamador somente neste momento.
 */
export type RefreshCriado = {
  /** Valor bruto do refresh token. */
  tokenBruto: string;
  /** Identificador do token persistido correspondente. */
  tokenId: TokenId;
  /** Data/hora de expiração do refresh. */
  expiraEm: Date;
};

/**
 * Entrada para validação de um refresh token bruto.
 */
export type ValidarRefreshInput = {
  /** Locatário esperado para o token. */
  locatarioId: LocatarioId;
  /** Valor bruto do refresh token recebido do cliente. */
  tokenBruto: string;
  /** Instante da validação. */
  agora: Date;
};

/**
 * Resultado de uma validação bem-sucedida de refresh token.
 */
export type RefreshValido = {
  /** Identificador do token persistido validado. */
  tokenId: TokenId;
  /** Usuário titular do refresh token. */
  usuarioId: UsuarioId;
  /** Data/hora de expiração do token validado. */
  expiraEm: Date;
};

/**
 * Resultado assíncrono da criação de refresh token.
 */
export type CriarRefreshResult = Promise<Result<RefreshCriado, ErroApp>>;

/**
 * Resultado assíncrono da validação de refresh token.
 */
export type ValidarRefreshResult = Promise<Result<RefreshValido, ErroApp>>;


