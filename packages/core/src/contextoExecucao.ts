// packages/core/src/contextoExecucao.ts

import { Permissao, Papel } from "./autorizacao/index";
import { LocatarioId } from "./locatario";
import { UsuarioId } from "./usuarios/index";
import { ErroApp } from "./erros";
import { Result, wrapOk, wrapErr } from "./result";
import { createErroApp } from "./ROPHelpers";

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
  /**
   * `null` = contexto técnico (job, migração, automação), sem usuário humano.
   * `undefined` = contexto não autenticado (endpoint público, antes do login).
   */
  usuarioId?: UsuarioId | null;
  papeis?: Papel[];
  permissoes?: Permissao[];
  /**
   * Relógio injetável para testes. Se ausente, use `new Date()` na borda.
   */
  agora?: () => Date;
} & ContextoExecucaoBrand;






export type CriarContextoExecucaoParams = Omit<ContextoExecucao, typeof CTX_BRAND>;

/**
 * ÚNICO “construtor” oficial.
 * - Faz cópias defensivas de arrays (evita mutação externa)
 * - Congela o objeto (imutável)
 * - Aplica branding (isContextoExecucao)
 * @param params 
 * @returns 
 */
export function criarContextoExecucao(params: CriarContextoExecucaoParams): ContextoExecucao {
  const locatarioId = params.locatarioId;
  if (typeof locatarioId !== "string" || locatarioId.trim().length === 0) {
    throw new Error("ContextoExecucao inválido: locatarioId é obrigatório.");
  }

  const usuarioId = params.usuarioId;
  if (usuarioId !== undefined && usuarioId !== null && (typeof usuarioId !== "string" || usuarioId.trim().length === 0)) {
    throw new Error("ContextoExecucao inválido: usuarioId deve ser string não vazia, null ou undefined."); // mantém a semântica: "" não é usuário válido
  }

  const permissoes = params.permissoes ? Object.freeze([...params.permissoes]) : undefined;
  const papeis = params.papeis ? Object.freeze([...params.papeis]) : undefined;

  const ctx: Omit<ContextoExecucao, typeof CTX_BRAND> & ContextoExecucaoBrand = {
    locatarioId, usuarioId, permissoes, papeis, agora: params.agora, [CTX_BRAND]: true,
  };

  return Object.freeze(ctx) as ContextoExecucao;
}

/** Type-guard: garante que veio do construtor oficial. */
export function isContextoExecucao(value: unknown): value is ContextoExecucao {
  if (!value || typeof value !== "object") return false;
  return (value as any)[CTX_BRAND] === true;
}














/**
 * Type-guard: indica se o contexto tem usuário autenticado.
 * @param ctx 
 * @returns 
 */
export function temUsuario(ctx: ContextoExecucao,): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.length > 0;
}

/**
 * Normaliza permissões (sempre retorna array).
 * Útil para evitar `ctx.permissoes ?? []` espalhado.
 * @param ctx 
 * @returns 
 */
export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? ctx.permissoes : [];
}

/**
 * Normaliza papéis (sempre retorna array).
 * @param ctx 
 * @returns 
 */
export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? ctx.papeis : [];
}

export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

export function possuiPermissao(ctx: ContextoExecucao, perm: Permissao): boolean {
  return normalizarPermissoes(ctx).includes(perm);
}

export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return !temUsuario(ctx)? createErroApp( {codigo: "NAO_AUTENTICADO"} ) : wrapOk(ctx);
}

export function exigirPermissao(ctx: ContextoExecucao, perm: Permissao): Result<ContextoExecucao, ErroApp> {
  if (!temUsuario(ctx)) {
    return createErroApp( {codigo: "NAO_AUTENTICADO"} );
  }

  if (!possuiPermissao(ctx, perm)) {
    return createErroApp( {codigo: "NAO_AUTORIZADO"} );
  }

  return wrapOk(ctx);
}

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

/** Cria um novo contexto com permissões resolvidas (imutável). */
export function comPermissoes(ctx: ContextoExecucao, permissoes: Permissao[]): ContextoExecucao {
  return criarContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: ctx.papeis,
    permissoes,
    agora: ctx.agora,
  });
}

/** Cria um novo contexto com papéis resolvidos (imutável). */
export function comPapeis(ctx: ContextoExecucao, papeis: Papel[]): ContextoExecucao {
  return criarContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis,
    permissoes: ctx.permissoes,
    agora: ctx.agora,
  });

/**
 * `permissoes` ausente geralmente significa que o contexto não foi montado/validado
 * (ex.: request sem autenticação). Nesse caso, tratamos como não autorizado.
 * @param ctx 
 * @returns 
 */
function naoAutenticado(ctx: ContextoExecucao): boolean {
  return !ctx.usuarioId || ctx.permissoes == null;
}

/**
 * 
 * @param ctx 
 * @param permissao 
 * @returns 
 */
export function exigirPermissao(ctx: ContextoExecucao, permissao: Permissao,): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  if (!permissoes.includes(permissao)) {
    return wrapErr(erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", { permissaoExigida: permissao }));
  }

  return wrapOk(undefined);
}

/**
 * 
 * @param ctx 
 * @param permissoesExigidas 
 * @returns 
 */
export function exigirTodas(ctx: ContextoExecucao, permissoesExigidas: Permissao[],): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const faltantes = permissoesExigidas.filter((p) => !permissoes.includes(p));

  if (faltantes.length > 0) {
    // Mantém o payload de details estável e simples para uso em UI/logs
    return wrapErr(
      erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", { permissaoExigida: faltantes[0] }),
    );
  }

  return wrapOk(undefined);
}

/**
 * 
 * @param ctx 
 * @param permissoesExigidas 
 * @returns 
 */
export function exigirAlguma(ctx: ContextoExecucao, permissoesExigidas: Permissao[],): Result<void, ReturnType<typeof erroApp>> {
  if (naoAutenticado(ctx)) {
    return wrapErr(erroApp("NAO_AUTENTICADO", "Usuário não autenticado."));
  }

  const permissoes = ctx.permissoes ?? [];
  const temAlguma = permissoesExigidas.some((p) => permissoes.includes(p));

  if (!temAlguma) {
    // Para "alguma", faz sentido mostrar a lista combinada; vazio vira "".
    return wrapErr(
      erroApp("NAO_AUTORIZADO", "Permissões insuficientes.", {permissaoExigida: permissoesExigidas.join("|")
      }),
    );
  }

  return wrapOk(undefined);
}