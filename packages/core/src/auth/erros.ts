// packages/core/src/auth/erros.ts

import { createErroApp } from "../kernel";

/**
 * Cria erro para credenciais inválidas no processo de autenticação.
 *
 * Deve ser usado quando a combinação de identificador e segredo não puder
 * autenticar o usuário sem revelar detalhes sensíveis da verificação.
 *
 * @returns `Err(ErroApp)` específico do pacote `auth`.
 */
export function credenciaisInvalidas() {
  return createErroApp({ codigo: "AUTH_CREDENCIAIS_INVALIDAS", detalhes: {} });
}

/**
 * Cria erro para token inválido ou expirado no fluxo de autenticação.
 *
 * Útil em validação de access token, refresh token ou sessões derivadas.
 *
 * @returns `Err(ErroApp)` específico do pacote `auth`.
 */
export function tokenInvalidoOuExpirado() {
  return createErroApp({ codigo: "AUTH_TOKEN_INVALIDO_OU_EXPIRADO", detalhes: {} });
}

/**
 * Cria erro quando o usuário existe, mas está em estado incompatível com autenticação.
 *
 * @param status Estado atual do usuário que impediu a autenticação.
 * @returns `Err(ErroApp)` com contexto do estado bloqueante.
 */
export function usuarioNaoPodeAutenticar(status: string) {
  return createErroApp({ codigo: "AUTH_USUARIO_NAO_PODE_AUTENTICAR", detalhes: { status } });
}

/**
 * Cria erro quando o locatário existe, mas está em estado incompatível com autenticação.
 *
 * @param status Estado atual do locatário que impediu a autenticação.
 * @returns `Err(ErroApp)` com contexto do estado bloqueante.
 */
export function locatarioNaoPodeAutenticar(status: string) {
  return createErroApp({ codigo: "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR", detalhes: { status } });
}

/**
 * Cria erro para entrada inválida em operações do pacote de autenticação.
 *
 * @param detalhes Metadados estruturados sobre a invalidez detectada.
 * @returns `Err(ErroApp)` específico do pacote `auth`.
 */
export function authEntradaInvalida(detalhes?: Record<string, unknown>) {
  return createErroApp({ codigo: "AUTH_ENTRADA_INVALIDA", detalhes });
}

/**
 * Cria erro para sessão inválida no fluxo de autenticação.
 *
 * @returns `Err(ErroApp)` específico do pacote `auth`.
 */
export function sessaoInvalida() {
  return createErroApp({ codigo: "AUTH_SESSAO_INVALIDA", detalhes: {} });
}
