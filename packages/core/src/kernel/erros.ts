// packages/core/src/erros.ts

/**
 * Catálogo canônico de códigos de erro da aplicação.
 *
 * Este tipo concentra todos os códigos usados pelos pacotes do Core e serve
 * como contrato comum entre domínio, adapters, API HTTP, logs e auditoria.
 *
 * Regras:
 * - cada pacote pode ter códigos específicos do seu domínio;
 * - códigos genéricos continuam existindo para falhas transversais;
 * - mensagens padrão devem permanecer centralizadas neste arquivo;
 * - códigos novos devem ser acrescentados aqui antes de serem usados nos módulos.
 */
export type CodigoErroKernel =
  | "NAO_AUTORIZADO"
  | "NAO_AUTENTICADO"
  | "INVALIDO"
  | "NAO_ENCONTRADO"
  | "ERRO_INTERNO"
  | "CONFLITO"
  | "SESSAO_INVALIDA"
  | "TRANSICAO_ESTADO_INVALIDA";

export type CodigoErroApp = CodigoErroKernel | (string & {});

export const CODIGOS_ERRO_KERNEL = [
  "NAO_AUTORIZADO",
  "NAO_AUTENTICADO",
  "INVALIDO",
  "NAO_ENCONTRADO",
  "ERRO_INTERNO",
  "CONFLITO",
  "SESSAO_INVALIDA",
  "TRANSICAO_ESTADO_INVALIDA",
] as const satisfies readonly CodigoErroKernel[];

export const CODIGOS_ERRO_APP = CODIGOS_ERRO_KERNEL;

export function isCodigoErroKernel(codigo: string): codigo is CodigoErroKernel {
  return (CODIGOS_ERRO_KERNEL as readonly string[]).includes(codigo);
}

export function isCodigoErroApp(codigo: string): codigo is CodigoErroKernel {
  return isCodigoErroKernel(codigo);
}

/**
 * Erro de domínio da aplicação.
 * - NÃO depende de HTTP
 * - NÃO lança exceção
 * - É dado puro (serializável)
 */
export interface ErroApp<Codigo extends string = string> {
  codigo: Codigo;
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
export function erroApp<Codigo extends string = CodigoErroApp>(codigo: Codigo, mensagem: string, detalhes?: Record<string, unknown>, causa?: unknown): ErroApp<Codigo> {
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
