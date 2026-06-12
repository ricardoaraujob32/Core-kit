// packages/core/src/kernel/utils.ts

import type { ErroApp } from "./erros.js";
import type { Result } from "./result.js";
import { wrapOk } from "./result.js";
import { createErroApp } from "./ROPHelpers.js";

/**
 * Propósito do arquivo:
 * reúne validadores transversais e normalizadores básicos do kernel,
 * reutilizados por múltiplos módulos de domínio antes do mapeamento
 * para erros específicos de cada pacote.
 */
/**
 *  Sugestão:
 * Considerar especializar `erroValidacao` por domínio no futuro.
 *
 * Hoje ele usa código genérico ("INVALIDO"), o que é correto no kernel,
 * mas pode dificultar rastreabilidade em logs se não houver mapeamento
 * posterior nos validadores de domínio.
 */

/**
 * Cria erro genérico de validação transversal do kernel.
 *
 * Esta função é usada por validadores básicos reutilizáveis, antes do
 * mapeamento para erros específicos de cada pacote de domínio.
 *
 * @param campo Nome lógico do campo rejeitado.
 * @param valor Valor original que falhou na validação.
 * @returns `Err(ErroApp)` com código genérico de entrada inválida.
 */
function erroValidacao(campo: string, valor?: unknown): Result<never, ErroApp> {
  return createErroApp({
    codigo: "INVALIDO",
    mensagem: "Validação transversal inválida.",
    detalhes: { campo, valor },
  });
}

/**
 * Valida um texto obrigatório e devolve sua forma normalizada com `trim`.
 *
 * Regras:
 * - o valor deve ser `string`;
 * - após `trim`, deve possuir ao menos `tamanhoMinimo` caracteres.
 *
 * @param valor Texto a validar.
 * @param campo Nome lógico do campo para contexto de erro.
 * @param tamanhoMinimo Quantidade mínima de caracteres válidos após `trim`.
 * @returns `Ok(string)` com texto normalizado ou `Err(ErroApp)` genérico.
 */
export function validarTextoObrigatorio(valor: string, campo: string, tamanhoMinimo = 1): Result<string, ErroApp> {
  if (typeof valor !== "string") {
    return erroValidacao(campo, valor);
  }

  const trim = valor.trim();

  if (trim.length < tamanhoMinimo) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(trim);
}

/**
 * Valida um identificador textual genérico.
 *
 * Atualmente delega para `validarTextoObrigatorio`, preservando um ponto
 * único de evolução futura caso IDs passem a exigir formato específico.
 *
 * @param valor Identificador textual a validar.
 * @param campo Nome lógico do campo de ID.
 * @returns `Ok(string)` com ID normalizado ou `Err(ErroApp)` genérico.
 */
export function validarIdGenerico(valor: string, campo: string): Result<string, ErroApp> {
  return validarTextoObrigatorio(valor, campo, 1);
}

/**
 * Normaliza um endereço de e-mail.
 *
 * A normalização atual:
 * - remove espaços nas extremidades;
 * - converte para minúsculas.
 *
 * @param email E-mail bruto informado na entrada.
 * @returns E-mail normalizado para persistência e comparação.
 */
export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Valida um endereço de e-mail e devolve sua forma normalizada.
 *
 * @param email E-mail bruto a validar.
 * @param campo Nome lógico do campo, usado no contexto de erro.
 * @returns `Ok(string)` com e-mail normalizado ou `Err(ErroApp)` genérico.
 */
export function validarEmail(email: string, campo = "email"): Result<string, ErroApp> {
  if (typeof email !== "string") {
    return erroValidacao(campo, email);
  }

  const normalizado = normalizarEmail(email);
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(normalizado)) {
    return erroValidacao(campo, email);
  }

  return wrapOk(normalizado);
}

/**
 * Valida se um valor é uma instância válida de `Date`.
 *
 * @param valor Valor a validar.
 * @param campo Nome lógico do campo.
 * @returns `Ok(Date)` quando o valor representa uma data válida.
 */
export function validarData(valor: Date, campo: string): Result<Date, ErroApp> {
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(valor);
}

/**
 * Valida se um número é finito e estritamente positivo.
 *
 * @param valor Número a validar.
 * @param campo Nome lógico do campo.
 * @returns `Ok(number)` quando o valor é positivo; `Err(ErroApp)` caso contrário.
 */
export function validarNumeroPositivo(valor: number, campo: string): Result<number, ErroApp> {
  if (!Number.isFinite(valor) || valor <= 0) {
    return erroValidacao(campo, valor);
  }

  return wrapOk(valor);
}
