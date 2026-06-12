// packages/core/src/tokens/erros.ts

import { createErroApp } from "../kernel";
import { TokenId } from "./tipos";

/**
 * 
 */
export type CodigoErroToken = 
  | "TOKEN_INVALIDO" 
  | "TOKEN_NAO_ENCONTRADO"
  | "TOKEN_REVOGADO"
  | "TOKEN_EXPIRADO"
  | "TOKEN_HASH_JA_EXISTE"
  | "TOKEN_ROTACAO_CONFLITO"

/**
 * Cria erro para entrada inválida em operações do domínio de tokens.
 *
 * Útil para validação de payloads de emissão, revogação, rotação e validação
 * de refresh tokens.
 *
 * @param detalhes Metadados estruturados da invalidez detectada.
 * @returns `Err(ErroApp)` com contexto de token inválido de entrada.
 */
export function entradaInvalida(detalhes?: Record<string, unknown>) {
  return createErroApp({
    codigo: "TOKEN_INVALIDO",
    mensagem: "Entrada do token inválida.",
    detalhes,
  });
}

/**
 * Cria erro de autenticação derivado de token inválido, expirado ou revogado.
 *
 * Este helper é útil em bordas de autenticação onde o efeito prático da falha
 * é tratar a requisição como não autenticada.
 *
 * @returns `Err(ErroApp)` com semântica de não autenticação.
 */
export function tokenNaoAutenticado() {
  return createErroApp({
    codigo: "NAO_AUTENTICADO",
    mensagem: "Token inválido, expirado ou revogado.",
  });
}

/**
 * Cria erro específico para conflito na rotação encadeada de tokens.
 *
 * Use este helper quando a operação detectar concorrência, reaproveitamento
 * indevido ou qualquer inconsistência no fluxo de rotação.
 *
 * @param detalhes Metadados estruturados sobre o conflito.
 * @returns `Err(ErroApp)` com código específico do módulo de tokens.
 */
export function conflitoRotacao(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "TOKEN_ROTACAO_CONFLITO", mensagem: "Conflito na rotação do token.", detalhes });
}

/**
 * Cria erro para dados inválidos de token.
 *
 * @param detalhes Metadados estruturados sobre o token inválido.
 * @returns `Err(ErroApp)` com código específico do módulo.
 */
export function tokenInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "TOKEN_INVALIDO", mensagem: "Dados do token inválidos.", detalhes });
}

/**
 * Cria erro para token inexistente.
 *
 * O identificador pode ser um `tokenId` lógico ou um hash/token textual,
 * dependendo do ponto da operação em que a busca ocorreu.
 *
 * @param tokenIdOuHash Identificador ou hash/token que não foi encontrado.
 * @returns `Err(ErroApp)` com contexto de busca.
 */
export function tokenNaoEncontrado(tokenIdOuHash: TokenId | string) {
  return createErroApp({ codigo: "TOKEN_NAO_ENCONTRADO", mensagem: "Token não encontrado.", detalhes: { tokenIdOuHash } });
}

/**
 * Cria erro para token revogado.
 *
 * @param tokenId Identificador do token revogado.
 * @returns `Err(ErroApp)` com contexto do token revogado.
 */
export function tokenRevogado(tokenId: TokenId) {
  return createErroApp({ codigo: "TOKEN_REVOGADO", mensagem: "Token revogado.", detalhes: { tokenId } });
}

/**
 * Cria erro para token expirado.
 *
 * @param tokenId Identificador do token expirado.
 * @returns `Err(ErroApp)` com contexto do token expirado.
 */
export function tokenExpirado(tokenId: TokenId) {
  return createErroApp({ codigo: "TOKEN_EXPIRADO", mensagem: "Token expirado.", detalhes: { tokenId } });
}

/**
 * Cria erro de conflito para hash de token já existente.
 *
 * @param hashToken Hash que colidiu com um registro já persistido.
 * @returns `Err(ErroApp)` específico do domínio de tokens.
 */
export function hashTokenJaExiste(hashToken: string) {
  return createErroApp({ codigo: "TOKEN_HASH_JA_EXISTE", mensagem: "Já existe token com este hash.", detalhes: { hashToken } });
}
