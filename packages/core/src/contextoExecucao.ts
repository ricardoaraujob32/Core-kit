// packages/core/src/contextoExecucao.ts

import { Permissao, Papel } from "./autorizacao/index";
import { LocatarioId } from "./locatario";
import { UsuarioId } from "./usuarios/index";
import { ErroApp } from "./erros";
import { Result, wrapOk } from "./result";
import { createErroApp } from "./ROPHelpers";

/**
 * Cria um símbolo único que marca o contexto.
 * Impede falsificação de contexto e centraliza a criação numa fábrica.
 */
const CTX_BRAND = Symbol.for("@core-kit/ContextoExecucao");
type ContextoExecucaoBrand = { readonly [CTX_BRAND]: true };

/**
 * ContextoExecucao representa as informações mínimas para execução segura:
 * - quem (usuarioId)
 * - em qual locatário (locatarioId)
 * - quais permissões já foram resolvidas (permissoes)
 */
export type ContextoExecucao = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  papeis?: readonly Papel[];
  permissoes?: readonly Permissao[];
  agora?: () => Date;
} & ContextoExecucaoBrand;

/**
 * Um tipo que representa os atributos necessários para a criação do contexto.
 * Deve ser passado como argumento para a fábrica.
 */
export type CreateContextoExecucaoParams = Omit<ContextoExecucao, typeof CTX_BRAND>;

/**
 * ÚNICO “construtor” oficial.
 * - Faz cópias defensivas de arrays (evita mutação externa)
 * - Congela o objeto (imutável)
 * - Aplica branding (isContextoExecucao)
 * @param params os argumentos do contexto:
 * - (obrigatório) locatarioId: identifica a quem pertence o contexto;
 * - usuarioId?: 'null` = contexto técnico (job, migração, automação), sem usuário humano. `undefined` = contexto não autenticado (endpoint público, antes do login).
 * - papeis?: papéis atribuídos ao usuário.
 * - permissoes?: permissões atribuídas ao usuário.
 * - agora?: Relógio injetável para testes. Se ausente, use `new Date()` na borda.
 * @returns o contexto de execução para um locatário.
 */
export function createContextoExecucao(params: CreateContextoExecucaoParams): ContextoExecucao {
  const locatarioId = params.locatarioId;
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    throw new Error("ContextoExecucao inválido: locatarioId é obrigatório.");
  }

  const usuarioId = params.usuarioId;
  if (usuarioId === null) {
    throw new Error("ContextoExecucao inválido: usuarioId não pode ser null.");
  }

  if (usuarioId !== undefined && (typeof usuarioId !== "string" || usuarioId.trim().length === 0)) {
    throw new Error("ContextoExecucao inválido: usuarioId deve ser string não vazia, null ou undefined."); // mantém a semântica: "" não é usuário válido
  }
  
  const permissoes = params.permissoes ? Object.freeze([...params.permissoes]) : undefined;
  const papeis = params.papeis ? Object.freeze([...params.papeis]) : undefined;

  const ctx: Omit<ContextoExecucao, typeof CTX_BRAND> & ContextoExecucaoBrand = {
    locatarioId, usuarioId, permissoes, papeis, agora: params.agora, [CTX_BRAND]: true,
  };

  return Object.freeze(ctx) as ContextoExecucao;
}

/** 
 * Type-guard: garante que veio do construtor oficial.
 */
export function isContextoExecucao(value: unknown): value is ContextoExecucao {
  if (!value || typeof value !== "object") return false;
  return ( (value as any)[CTX_BRAND] === true && typeof (value as any).locatarioId === "string" && (value as any).locatarioId.length > 0);
}

/**
 * Type-guard: indica se o contexto tem usuário autenticado.
 * @param ctx o contexto do locatário
 * @returns true se o contexto tem usuário; do contrário, false
 */
export function temUsuario(ctx: ContextoExecucao,): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

/**
 * Valida se o contexto tem usuário
 * @param ctx o contexto do locatário
 * @returns um Result com o contexto validado se for sucesso; do contrário, um Result de erro
 */
export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return !temUsuario(ctx)? createErroApp( {codigo: "NAO_AUTENTICADO"} ) : wrapOk(ctx);
}

/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 * @param ctx o contexto do locatário
 * @returns as permissões normalizadas
 */
export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? ctx.permissoes : [];
}

/**
 * Normaliza papéis (sempre retorna array).
 * @param ctx o contexto do locatário
 * @returns os papéis normalizados
 */
export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? ctx.papeis : [];
}

/**
 * Cria uma função que não recebe argumentos e retorna Date; retorna a existente se houver
 * @param ctx o contexto do locatário
 * @returns a função existente; se não existe, cria uma nova
 */
export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

/**
 * Verifica se tem a permissão específica
 * @param ctx o contexto do locatário
 * @param perm a permissão
 * @returns true se tiver a permissão; do contrário, false
 */
export function possuiPermissao(ctx: ContextoExecucao, perm: Permissao): boolean {
  return normalizarPermissoes(ctx).includes(perm);
}

/**
 * Elimina dados duplicados de um vetor
 * @param array o vetor
 * @returns um vetor que garante dados sem duplicações
 */
function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

/**
 * Cria um novo contexto com permissões resolvidas (imutável). 
 * @param ctx o contexto do locatário
 * @param permissoes a lista de permissões
 * @returns um contexto novo com as permissões acrescentadas
 */
export function comPermissoes(ctx: ContextoExecucao, permissoes: Permissao[]): ContextoExecucao {
  return createContextoExecucao( {locatarioId: ctx.locatarioId, usuarioId: ctx.usuarioId, papeis: ctx.papeis, permissoes, agora: ctx.agora,} );
}

/**
 * Cria um novo contexto com papéis resolvidos (imutável).
 * @param ctx o contexto do locatário
 * @param papeis a lista de papéis
 * @returns um contexto novo com os papéis acrescentados
 */
export function comPapeis(ctx: ContextoExecucao, papeis: Papel[]): ContextoExecucao {
  return createContextoExecucao( {locatarioId: ctx.locatarioId, usuarioId: ctx.usuarioId, papeis, permissoes: ctx.permissoes, agora: ctx.agora,} );
}
