// packages/core/src/locatarios/validadores.ts

import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio } from "../kernel";
import { locatarioInvalido } from "./erros";
import { LocatarioId, LocatarioSlug } from "./tipos";

/**
 * Converte erro genérico de validação transversal em erro específico do
 * domínio de locatários.
 *
 * Este helper mantém o módulo desacoplado dos detalhes do kernel e garante
 * que falhas de validação sejam reportadas com semântica própria do pacote.
 *
 * @param resultado Resultado bruto da validação transversal.
 * @param campo Nome lógico do campo validado.
 * @param valor Valor original rejeitado.
 * @returns Resultado original em caso de sucesso, ou erro específico do módulo.
 */
function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
  if (resultado.ok) return resultado;
  return locatarioInvalido({ campo, valor });
}

/**
 * Valida o nome de um locatário.
 *
 * Regras atuais:
 * - deve ser texto;
 * - deve possuir ao menos 2 caracteres úteis após `trim`.
 *
 * @param nome Nome informado para o locatário.
 * @returns `Ok(string)` com nome normalizado ou erro específico do módulo.
 */
export function validarNomeLocatario(nome: string): Result<string, ErroApp> {
  return mapearErro( validarTextoObrigatorio(nome, "nome", 2), "nome", nome );
}

/**
 * Valida o identificador lógico de um locatário.
 *
 * @param locatarioId Identificador textual do locatário.
 * @returns `Ok(string)` com ID validado ou erro específico do módulo.
 */
export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
  return mapearErro( validarIdGenerico(locatarioId, "locatarioId"), "locatarioId", locatarioId );
}

/**
 * Valida o slug de um locatário
 * @param slug identificador único de URL do locatário
 * @returns `Ok(string)` com slug normalizado ou erro específico do módulo.
 */
export function validarLocatarioSlug(slug: LocatarioSlug): Result<string, ErroApp>{
  return mapearErro( validarTextoObrigatorio(slug, "slug", 2), "slug", slug );
}
