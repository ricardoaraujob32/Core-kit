/**
 * ErroApp padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */

// packages/core/src/errors.ts
export type CodigoErroApp =
  | "NAO_AUTORIZADO"
  | "NAO_AUTENTICADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "ERRO_INTERNO"
  | "CONFLITO";

/**
 * Erro de domínio da aplicação.
 *
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface ErroApp {
  code: CodigoErroApp;
  message: string;

  /**
   * Detalhes estruturados para cliente / logs. Deve ser JSON-safe.
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
 * Centraliza criação para manter consistência e facilitar observabilidade.
 */

export function erroApp(code: CodigoErroApp, message: string, details?: Record<string, unknown>, cause?: unknown,): ErroApp {
  return { code, message, details, cause, };
}

/**
 * Type guard utilitário.
 */
export function isErroApp(value: unknown): value is ErroApp {
  if (!value || typeof value !== "object") return false;

  const v = value as Partial<ErroApp>;

  return typeof v.code === "string" && typeof v.message === "string";
}
