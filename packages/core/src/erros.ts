// packages/core/src/erros.ts

/**
 * padroniza erros da aplicação (API, serviços, etc.)
 * para log, retorno HTTP, auditoria e suporte.
 */
export type CodigoErroApp =
  | "NAO_AUTORIZADO"
  | "NAO_AUTENTICADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "ERRO_INTERNO"
  | "CONFLITO"
  | "SESSAO_INVALIDA";

/**
 * Retorna mensagens padronizadas de erro
 * @param codigo tipo padronizado
 * @returns mensagem padronizada
 */
  export function mapCodigoErroToMensagemErro(codigo: CodigoErroApp): string {
    switch (codigo) {
      case "NAO_AUTENTICADO":
        return "Usuário não autenticado.";
      case "NAO_AUTORIZADO":
        return "Permissões insuficientes.";
      case "INVALIDO":
        return "Requisição inválida.";
      case "NAO_ENCONTRADO":
        return "Recurso não encontrado.";
      case "CONFLITO":
        return "Conflito de dados.";
      case "ERRO_INTERNO":
        return "Erro interno.";
      case "SESSAO_INVALIDA":
        return "Sessão inválida.";
      default:
        return "Desconhecido"; // Nunca deveria chamar
    }
  }

/**
 * Erro de domínio da aplicação.
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface ErroApp {
  codigo: CodigoErroApp;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  causa?: unknown;
}

/**
 * Construtor padrão de erros. Use o wrapper padrão para garantir argumentos validados.
 * @param codigo codigo de erro padronizado.
 * @param mensagem se não fornecida, vai exibir mensagem padronizada a partir do código.
 * @param detalhes Detalhes estruturados para cliente/logs. Deve ser JSON-safe.
 * @param causa Causa original do erro (ex: exceção capturada). Nunca deve ser enviada diretamente ao cliente.
 * @returns um erro padronizado para ser usado em API ROP.
 */
export function erroApp(codigo: CodigoErroApp, mensagem: string, detalhes?: Record<string, unknown>, causa?: unknown,): ErroApp {
  return {codigo: codigo, mensagem: mensagem, detalhes: detalhes, causa: causa,};
}

/**
 * Type guard utilitário.
 * @param value o valor
 * @returns true se for ErroApp; do contrário, false
 */
export function isErroApp(value: unknown): value is ErroApp {
  if (!value || typeof value !== "object") return false;

  const v = value as Partial<ErroApp>;

  return typeof v.codigo === "string" && typeof v.mensagem === "string";
}
