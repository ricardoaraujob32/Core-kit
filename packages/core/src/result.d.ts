/**
 * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
 *
 * Padrão:
 * - ok(value)  -> { ok: true, value }
 * - err(error) -> { ok: false, error }
 */
export type Ok<T> = {
    ok: true;
    value: T;
};
export type Err<E> = {
    ok: false;
    error: E;
};
export type Result<T, E> = Ok<T> | Err<E>;
/**
 * Cria um Result de sucesso.
 */
export declare function ok<T>(value: T): Ok<T>;
/**
 * Cria um Result de falha.
 */
export declare function err<E>(error: E): Err<E>;
/**
 * Type guard: verifica se o Result é Ok.
 */
export declare function isOk<T, E>(r: Result<T, E>): r is Ok<T>;
/**
 * Type guard: verifica se o Result é Err.
 */
export declare function isErr<T, E>(r: Result<T, E>): r is Err<E>;
//# sourceMappingURL=result.d.ts.map