// packages/core/src/result.ts

/**
 * Implementa o paradigma Railway Oriented Programing (ROP).
 * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
 *
 * Padrão:
 * - ok(value)  -> { ok: true, value }
 * - err(error) -> { ok: false, error }
 *
 * Operações ROP (railway):
 * - map      : transforma o value em Ok
 * - mapErr   : transforma o error em Err
 * - andThen  : encadeia Result (flatMap/bind)
 * - match    : reduz Result para um valor final
 * - unwrapOr : fallback em caso de erro
 * - tap/tapErr: efeitos colaterais sem quebrar o fluxo
 */

/**
 * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * um Result de sucesso
 */
export type Ok<T> = { ok: true; value: T };

/**
 * um Result de erro
 */
export type Err<E> = { ok: false; error: E };

/**
 * Fábrica de Result de sucesso. 
 * @param value tipo de dado parametrizado
 * @returns um Result com o tipo escolhido
 */
export function wrapOk<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Cria um Result de falha.
 * @param error tipo de erro padronizado
 * @returns um Result com as informações do erro fornecidas
 */
export function wrapErr<E>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Type guard: verifica se o Result é Ok. 
 * @param r o Result
 * @returns true se é Ok
 */
export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
  return r.ok === true;
}

/**
 * Type guard: verifica se o Result é Err.
 * @param r o Result
 * @returns true se é Err
 */
export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
  return r.ok === false;
}

/**
 * map: transforma o value quando Ok. Mantém Err inalterado.
 * @param r o Result
 * @param fn função que modifica apenas o fluxo correto do tipo T e retorna U
 * @returns o resultado da transformação se correto; devolve o original se erro
 */
export function map<T, E, U>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return r.ok ? wrapOk(fn(r.value)) : r;
}

/**
 * Faz o mesmo que map, porém é assíncrono
 * @param r o Result
 * @param fn função que modifica apenas o fluxo correto do tipo T e retorna U
 * @returns a Promise com o resultado da transformação se correto; devolve o original se erro
 */
export async function mapAsync<T, E, U>(r: Result<T, E>, fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
  return r.ok ? wrapOk(await fn(r.value)) : r;
}

/**
 * mapErr: transforma o error quando Err. Mantém Ok inalterado.
 * @param r o Result
 * @param fn função que modifica apenas o fluxo de  do tipo E e retorna U
 * @returns o resultado da transformação se erro; devolve o original se correto
 */
export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return r.ok ? r : wrapErr(fn(r.error));
}

/**
 * Faz o mesmo que mapErr, porém é assíncrono
 * @param r o Result
 * @param fn função que modifica apenas o fluxo de  do tipo E e retorna U
 * @returns a Promise com o resultado da transformação se erro; devolve o original se correto
 */
export async function mapErrAsync<T, E, F>(r: Result<T, E>, fn: (error: E) => Promise<F>): Promise<Result<T, F>> {
  return r.ok ? r : wrapErr(await fn(r.error));
}

/**
 * andThen (flatMap/bind): encadeia Result.
 * Se Ok -> aplica fn; se Err -> propaga Err.
 * @param r o Result
 * @param fn uma função que recebe T e retorna um Result de U e E.
 * @returns um Result de U ou um Result de erro.
 */
export function andThen<T, E, U>(r: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return r.ok ? fn(r.value) : r;
}

/**
 * O mesmo que andThen, porém assíncrono.
 * @param r o Result
 * @param fn uma função que recebe T e retorna uma Promise de Result de U e E.
 * @returns uma Promise de Result de U ou uma Promise de Result de erro.
 */
export async function andThenAsync<T, E, U>(r: Result<T, E>, fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
  return r.ok ? fn(r.value) : r;
}

/**
 * match: reduz Result para um valor final.
 * @param r o Result
 * @param handlers uma função de sucesso que recebe T e outra de erro que recebe E, ambas devolvem U
 * @returns um resultado de sucesso ou de erro
 */
export function match<T, E, U>(r: Result<T, E>, handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
  return r.ok ? handlers.ok(r.value) : handlers.err(r.error);
}

/**
 * unwrapOr: devolve value (Ok) ou fallback (Err).
 * @param r o Result
 * @param alternativo valor em caso de erro
 * @returns o valor T dentro do Result ou o valor de erro predefinido.
 */
export function unwrapOr<T, E>(r: Result<T, E>, alternativo: T): T {
  return r.ok ? r.value : alternativo;
}

/**
 * o mesmo que unwrapOr, mas executa uma função de erro em vez de um valor
 * @param r o Result
 * @param fn função que executa em caso de erro
 * @returns o valor T dentro do Result ou o valor T retornado pela função de erro
 */
export function unwrapOrElse<T, E>(r: Result<T, E>, fn: (e: E) => T): T {
  return r.ok ? r.value : fn(r.error);
}

/**
 * tap: executa efeito colateral em Ok e devolve o Result original.
 * @param r o Result
 * @param fn uma função que recebe T e não retorna valor
 * @returns o Result original
 */
export function tap<T, E>(r: Result<T, E>, fn: (value: T) => void): Result<T, E> {
  if (r.ok) fn(r.value);
  return r;
}

/**
 * tapErr: executa efeito colateral em Err e devolve o Result original.
 * @param r o Result
 * @param fn uma função que recebe E e não retorna valor
 * @returns o Result original
 */
export function tapErr<T, E>(r: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (!r.ok) fn(r.error);
  return r;
}
