/**
 * AppError padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */
export type AppErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "INVALID" | "NOT_FOUND" | "INTERNAL_ERROR" | "CONFLICT" | "VALIDATION";
/**
 * Erro de domínio da aplicação.
 *
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface AppError {
    code: AppErrorCode;
    message: string;
    /**
     * Detalhes estruturados para cliente / logs.
     * Deve ser JSON-safe.
     */
    details?: Record<string, unknown>;
    /**
     * Causa original do erro (ex: exceção capturada).
     * Nunca deve ser enviada diretamente ao cliente.
     */
    cause?: unknown;
}
/**
 * Factory padrão de AppError.
 *
 * Centraliza criação para manter consistência
 * e facilitar observabilidade.
 */
export declare function appError(code: AppErrorCode, message: string, details?: Record<string, unknown>, cause?: unknown): AppError;
/**
 * Type guard utilitário.
 */
export declare function isAppError(value: unknown): value is AppError;
//# sourceMappingURL=errors.d.ts.map