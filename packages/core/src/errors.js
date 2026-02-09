/**
 * AppError padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */
/**
 * Factory padrão de AppError.
 *
 * Centraliza criação para manter consistência
 * e facilitar observabilidade.
 */
export function appError(code, message, details, cause) {
    return {
        code,
        message,
        details,
        cause,
    };
}
/**
 * Type guard utilitário.
 */
export function isAppError(value) {
    if (!value || typeof value !== "object")
        return false;
    const v = value;
    return typeof v.code === "string" && typeof v.message === "string";
}
//# sourceMappingURL=errors.js.map