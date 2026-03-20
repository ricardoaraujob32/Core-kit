// packages/core/src/rbac/tipos.ts

import { ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { UsuarioId } from "../usuarios";

/**
 * Papéis sugeridos (opcionais). Use se fizer sentido para o projeto.
 * Mantido em português para facilitar documentação e consistência.
 */
export const PAPEIS_PADRAO = {
  SUPERADMIN: "SUPERADMIN",
  ADMIN: "ADMIN", // administração geral do locatário
  GERENTE: "GERENTE", // nível intermediário (ex.: gerente / supervisor)
  OPERADOR: "OPERADOR", // usuário operacional
  LEITOR: "LEITOR", // acesso somente leitura
} as const;

export type PapelPadrao = (typeof PAPEIS_PADRAO)[keyof typeof PAPEIS_PADRAO];

/**
 * "Papel" é um rótulo (apelido) que pode variar por locatário.
 * Ex.: "ADMIN_LOCATARIO", "GERENTE", "OPERADOR".
 *
 * Papel ajuda na UX e organização, mas o motor real de autorização usa permissões.
 */
export type Papel = string;

/**
 * Permissões oficiais do sistema.
 *
 * Regra de ouro:
 * - Backend, Core e Frontend compartilham ESTE contrato.
 * - Nunca usar strings mágicas fora daqui.
 * - Mudanças aqui são mudanças de domínio.
 */

export const Permissoes = {
  PLATAFORMA_LOCATARIO_CRIAR: "plataforma.locatario.criar",
  PLATAFORMA_LOCATARIO_LISTAR: "plataforma.locatario.listar",
  PLATAFORMA_USUARIO_CRIAR: "plataforma.usuario.criar",
  PLATAFORMA_USUARIO_LISTAR: "plataforma.usuario.listar",

  TENANT_USUARIO_CRIAR: "tenant.usuario.criar",
  TENANT_USUARIO_LISTAR: "tenant.usuario.listar",
  TENANT_USUARIO_ATUALIZAR: "tenant.usuario.atualizar",
  TENANT_USUARIO_ATRIBUIR_PAPEIS: "tenant.usuario.atribuirPapeis",

  TENANT_RBAC_PAPEL_CRIAR: "tenant.rbac.papel.criar",
  TENANT_RBAC_PAPEL_LISTAR: "tenant.rbac.papel.listar",
  TENANT_RBAC_PERMISSAO_ATRIBUIR: "tenant.rbac.permissao.atribuir",
  TENANT_RBAC_PERMISSAO_LISTAR: "tenant.rbac.permissao.listar",

  TENANT_AUDITORIA_LER: "tenant.auditoria.ler",

  AUTH_SESSAO_VALIDAR: "auth.sessao.validar",
  AUTH_SESSAO_REVOGAR: "auth.sessao.revogar",
} as const;

export type Permissao = (typeof Permissoes)[keyof typeof Permissoes];

/**
 * 
 */
export interface ContextoExecucaoRbac {
  locatarioId: LocatarioId;
  usuarioId?: UsuarioId;
  papeis?: Papel[];
  permissoes?: Permissao[];
  agora?: () => Date;
}

/**
 * 
 */
export interface ResolverPermissoesInput {
  ctx: ContextoExecucaoRbac;
}

/**
 * 
 */
export interface ResolverPermissoesOutput {
  ctx: ContextoExecucaoRbac;
  permissoes: Permissao[];
  papeis: Papel[];
}

/**
 * 
 */
export interface AutorizarOperacaoInput {
  ctx: ContextoExecucaoRbac;
  permissao: Permissao;
}

/**
 * 
 */
export type ResultadoResolverPermissoes = Promise< Result<ResolverPermissoesOutput, ErroApp> >;

/**
 * 
 */
export type ResultadoAutorizarOperacao = Result<void, ErroApp>;
