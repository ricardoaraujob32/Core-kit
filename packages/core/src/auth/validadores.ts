// packages/core/src/auth/validadores.ts

import { ErroApp, Result, validarEmail, validarIdGenerico, validarTextoObrigatorio } from "../kernel/index.js";
import { LocatarioId } from "../locatarios/index.js";
import { authEntradaInvalida } from "./erros.js";

/**
 * Converte falhas dos validadores transversais em erro específico
 * do fluxo de autenticação.
 *
 * @param resultado Resultado da validação compartilhada.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor rejeitado.
 * @returns `Ok` original ou `Err` específico do pacote `auth`.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return authEntradaInvalida({ campo, valor });
}

/**
 * Valida e normaliza o e-mail usado no fluxo de autenticação.
 *
 * @param email E-mail recebido da borda.
 * @returns `Ok(emailNormalizado)` quando o formato é aceito.
 */
export function validarEmailAuth(email: string): Result<string, ErroApp> {
  return mapearErro(validarEmail(email, "email"), "email", email);
}

/**
 * Valida a senha em texto puro recebida no fluxo de login.
 *
 * A senha deve ter pelo menos 8 caracteres após `trim`.
 *
 * @param senha Senha informada pelo usuário.
 * @returns `Ok(senhaNormalizada)` quando a entrada é válida.
 */
export function validarSenha(senha: string): Result<string, ErroApp> {
  return mapearErro(validarTextoObrigatorio(senha, "senha", 8), "senha", senha);
}

/**
 * Valida o identificador de locatário usado no fluxo de autenticação.
 *
 * @param locatarioId Identificador recebido.
 * @returns `Ok(locatarioId)` quando o valor atende ao contrato mínimo.
 */
export function validarLocatarioIdAuth(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro(validarIdGenerico(locatarioId, "locatarioId"), "locatarioId", locatarioId);
}

/**
 * Valida um token textual que não pode ser vazio.
 *
 * Útil para access tokens, refresh tokens e demais tokens recebidos
 * nas operações do pacote `auth`.
 *
 * @param token Token textual recebido.
 * @returns `Ok(token)` quando o valor não é vazio.
 */
export function validarTokenNaoVazio(token: string): Result<string, ErroApp> {
  return mapearErro(validarTextoObrigatorio(token, "token", 1), "token", token);
}
