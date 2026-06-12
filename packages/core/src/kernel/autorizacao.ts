import { createContextoExecucao, type ContextoExecucao } from "./contextoExecucao.js";
import type { ErroApp } from "./erros.js";
import type { Result } from "./result.js";
import { wrapOk } from "./result.js";
import { UsuarioId } from "../usuarios/index.js";
import { ModuloCodigo } from "../modulos/index.js";
import { createErroApp } from "./ROPHelpers.js";
import { Papel, Permissao } from "../rbac/index.js";

/**
 * Propósito do arquivo:
 * Fornece utilitários para manipulação, validação e enriquecimento
 * do contexto de execução no que diz respeito à autorização.
 *
 * Atua como camada intermediária entre:
 * - autenticação (quem é o usuário)
 * - autorização (o que ele pode fazer)
 *
 * Este módulo NÃO resolve permissões; apenas normaliza e garante consistência.
 */



export type EntradaPoliticaSeguranca<
  TOperacao extends string = string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
> = {
  operacao: TOperacao;
  ctx?: ContextoExecucao;
  locatarioId?: string | null;
  usuarioId?: string | null;
  entidadeId?: string | null;
  entidadeTipo?: string | null;
  dados?: TDados;
};

export interface PoliticaSegurancaPorta<
  TOperacao extends string = string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
> {
  autorizar(
    entrada: EntradaPoliticaSeguranca<TOperacao, TDados>,
  ): Promise<Result<void, ErroApp>>;
}

export type DepsPoliticaSeguranca<
  TOperacao extends string = string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
> = {
  politicaSeguranca?: PoliticaSegurancaPorta<TOperacao, TDados>;
};

export async function autorizarPorPolitica<
  TOperacao extends string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
>(
  deps: DepsPoliticaSeguranca<TOperacao, TDados>,
  entrada: EntradaPoliticaSeguranca<TOperacao, TDados>,
): Promise<Result<void, ErroApp> | null> {
  if (!deps.politicaSeguranca) return null;
  return deps.politicaSeguranca.autorizar(entrada);
}

export async function exigirAutorizacao<
  TOperacao extends string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
>(
  deps: DepsPoliticaSeguranca<TOperacao, TDados>,
  entrada: EntradaPoliticaSeguranca<TOperacao, TDados>,
): Promise<Result<void, ErroApp>> {
  if (!deps.politicaSeguranca) {
    return createErroApp({
      codigo: "NAO_AUTORIZADO",
      mensagem: "Política de segurança não configurada.",
      detalhes: { operacao: entrada.operacao },
    });
  }

  return deps.politicaSeguranca.autorizar(entrada);
}

export function criarPoliticaPermissiva<
  TOperacao extends string = string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
>(): PoliticaSegurancaPorta<TOperacao, TDados> {
  return {
    async autorizar() {
      return wrapOk(undefined);
    },
  };
}

export function criarPoliticaNegadora<
  TOperacao extends string = string,
  TDados extends Record<string, unknown> = Record<string, unknown>,
>(params?: {
  mensagem?: string;
}): PoliticaSegurancaPorta<TOperacao, TDados> {
  return {
    async autorizar(entrada) {
      return createErroApp({
        codigo: "NAO_AUTORIZADO",
        mensagem: params?.mensagem ?? "Operação não autorizada.",
        detalhes: {
          operacao: entrada.operacao,
          locatarioId: entrada.locatarioId,
          usuarioId: entrada.usuarioId,
          entidadeId: entrada.entidadeId,
          entidadeTipo: entrada.entidadeTipo,
        },
      });
    },
  };
}

/**
 * Verifica se o contexto possui um usuário autenticado válido.
 *
 * @param ctx Contexto de execução.
 * @returns `true` se há usuário válido (string não vazia).
 */
export function temUsuario(ctx: ContextoExecucao): ctx is ContextoExecucao & { usuarioId: UsuarioId } {
  return typeof ctx.usuarioId === "string" && ctx.usuarioId.trim().length > 0;
}

/**
 * Garante que o contexto possui um usuário autenticado.
 *
 * @param ctx Contexto de execução.
 * @returns `Ok(ctx)` quando autenticado; `Err` caso contrário.
 */
export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
  return temUsuario(ctx)
    ? wrapOk(ctx)
    : createErroApp({
        codigo: "NAO_AUTENTICADO",
        mensagem: "Usuário não autenticado.",
        detalhes: {},
      });
}

/**
 * Normaliza permissões do contexto para array mutável.
 *
 * @param ctx Contexto de execução.
 * @returns Lista de permissões (cópia defensiva).
 */
export function normalizarPermissoes(ctx: ContextoExecucao): Permissao[] {
  return Array.isArray(ctx.permissoes) ? [...ctx.permissoes] : [];
}

/**
 * Normaliza papéis do contexto para array mutável.
 *
 * @param ctx Contexto de execução.
 * @returns Lista de papéis (cópia defensiva).
 */
export function normalizarPapeis(ctx: ContextoExecucao): Papel[] {
  return Array.isArray(ctx.papeis) ? [...ctx.papeis] : [];
}

/**
 * Obtém o instante atual a partir do contexto.
 *
 * @param ctx Contexto de execução.
 * @returns Data atual usando relógio injetado ou sistema.
 */
export function normalizarRelogio(ctx: ContextoExecucao): Date {
  return ctx.agora ? ctx.agora() : new Date();
}

/**
 * Normaliza módulos do contexto para array mutável.
 * @param ctx Contexto de execução.
 * @returns Lista de módulos habilitados (cópia defensiva).
 */
export function normalizarModulosHabilitados(ctx: ContextoExecucao): ModuloCodigo[] {
  return Array.isArray(ctx.modulosHabilitados) ? [...ctx.modulosHabilitados] : [];
}

/**
 * Garante um conjunto de itens únicos
 * @param itens o conjunto
 * @returns o conjunto com itens únicos
 */
function unique<T>(itens: T[]): T[] {
  return Array.from(new Set(itens));
}

/**
 * Retorna novo contexto com permissões atualizadas.
 *
 * @param ctx Contexto original.
 * @param permissoes Lista de permissões.
 * @returns Novo contexto imutável.
 */
export function comPermissoes(ctx: ContextoExecucao, permissoes: Permissao[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: ctx.papeis,
    permissoes: unique(permissoes),
    modulosHabilitados: ctx.modulosHabilitados,
    agora: ctx.agora,
  });
}

/**
 * Retorna novo contexto com papéis atualizados.
 *
 * @param ctx Contexto original.
 * @param papeis Lista de papéis.
 * @returns Novo contexto imutável.
 */
export function comPapeis(ctx: ContextoExecucao, papeis: Papel[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: unique(papeis),
    permissoes: ctx.permissoes,
    modulosHabilitados: ctx.modulosHabilitados,
    agora: ctx.agora,
  });
}

/**
 * Retorna novo contexto com módulos habilitados.
 *
 * @param ctx Contexto original.
 * @param modulosHabilitados Lista de módulos.
 * @returns Novo contexto imutável.
 */
export function comModulosHabilitados(ctx: ContextoExecucao, modulosHabilitados: ModuloCodigo[]): ContextoExecucao {
  return createContextoExecucao({
    locatarioId: ctx.locatarioId,
    usuarioId: ctx.usuarioId,
    papeis: ctx.papeis,
    permissoes: ctx.permissoes,
    modulosHabilitados: unique(modulosHabilitados),
    agora: ctx.agora,
  });
}
