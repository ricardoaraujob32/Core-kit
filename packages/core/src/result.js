/**
 * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
 *
 * Padrão:
 * - ok(value)  -> { ok: true, value }
 * - err(error) -> { ok: false, error }
 */
/**
 * Cria um Result de sucesso.
 */
export function ok(value) {
    return { ok: true, value };
}
/**
 * Cria um Result de falha.
 */
export function err(error) {
    return { ok: false, error };
}
/**
 * Type guard: verifica se o Result é Ok.
 */
export function isOk(r) {
    return r.ok === true;
}
/**
 * Type guard: verifica se o Result é Err.
 */
export function isErr(r) {
    return r.ok === false;
}
//# sourceMappingURL=result.js.map