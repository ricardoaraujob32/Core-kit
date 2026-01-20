/**
 * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
 *
 * Padrão:
 * - ok(value)  -> { ok: true, value }
 * - err(error) -> { ok: false, error }
 */

export type Ok<T> = { ok: true; value: T };
export type Err<E> = { ok: false; error: E };

export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Cria um Result de sucesso.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Cria um Result de falha.
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Type guard: verifica se o Result é Ok.
 */
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok === true;
}

/**
 * Type guard: verifica se o Result é Err.
 */
export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return r.ok === false;
}
