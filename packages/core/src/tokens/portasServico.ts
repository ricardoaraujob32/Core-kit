// packages/core/src/tokens/portasServico.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";
import { TokenId } from "./tipos";

/**
 * Porta de serviço do domínio de tokens.
 *
 * Diferentemente do repositório, esta interface representa capacidades
 * operacionais de mais alto nível: criação de refresh bruto, validação
 * de refresh e revogação orquestrada.
 */
export interface TokensServicePorta {
  /**
   * Cria um refresh token completo, incluindo valor bruto e metadados.
   *
   * @param params Contexto de emissão do refresh token.
   * @returns `Ok` com token bruto, identificador persistido e expiração.
   */
  criarRefresh(params: { locatarioId: LocatarioId; usuarioId: UsuarioId; agora: Date; ttlMs: number })
    : Promise<Result<{ tokenBruto: string; tokenId: TokenId; expiraEm: Date }, ErroApp>>;

  /**
   * Valida um refresh token bruto e devolve sua identidade lógica.
   *
   * @param params Contexto de validação do refresh token.
   * @returns `Ok` com identificadores e expiração quando válido.
   */
  validarRefresh(params: { locatarioId: LocatarioId; tokenBruto: string; agora: Date })
    : Promise<Result<{ tokenId: TokenId; usuarioId: UsuarioId; expiraEm: Date }, ErroApp>>;

  /**
   * Revoga um token de refresh no contexto informado.
   *
   * @param params Dados da revogação.
   * @returns `Ok(void)` quando a operação é concluída.
   */
  revogar(params: { locatarioId: LocatarioId; tokenId: TokenId; usuarioId: UsuarioId; agora: Date; motivo?: string })
    : Promise<Result<void, ErroApp>>;

  // opcional: encadearRotacao...
}

/**
 * Porta de serviço criptográfico para o módulo de tokens.
 *
 * Esta interface abstrai geração de token seguro e hashing do valor bruto,
 * sem expor ao Core bibliotecas criptográficas concretas.
 */
export interface CriptoTokensPorta {
  /**
   * Gera um token bruto seguro para uso em fluxos de refresh ou one-time.
   *
   * @returns `Ok(tokenBruto)` quando a geração é bem-sucedida.
   */
  gerarTokenSeguro(): Promise<Result<string, ErroApp>>;

  /**
   * Gera o hash persistível de um token bruto.
   *
   * @param tokenBruto Valor bruto do token.
   * @returns `Ok(hashToken)` quando a operação é bem-sucedida.
   */
  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
}
