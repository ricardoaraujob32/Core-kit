// packages/core/src/tokens/portasServico.ts

import { ErroApp, Result } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { UsuarioId } from "../usuarios/index.js";
import { TokenId } from "./tipos.js";

/**
 * Porta de serviço do domínio de tokens.
 *
 * Diferentemente do repositório, esta interface representa operações
 * de mais alto nível do módulo, usadas principalmente por autenticação:
 * - criação de refresh token bruto + persistência associada;
 * - validação de refresh token bruto;
 * - revogação orquestrada de refresh token.
 */
export interface TokensServicePorta {
  /**
   * /**
   * Cria um refresh token completo.
   *
   * O resultado inclui:
   * - valor bruto a ser devolvido para a borda;
   * - identificador lógico persistido;
   * - data de expiração calculada.
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
 * Porta criptográfica auxiliar do módulo de tokens.
 *
 * Esta interface abstrai:
 * - geração de token bruto seguro;
 * - derivação do hash persistível correspondente.
 *
 * O Core não conhece bibliotecas concretas de criptografia.
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
