// packages/core/src/rbac/tipos.ts

import { ContextoExecucao, ErroApp, Result } from "../kernel";
import { LocatarioId } from "../locatarios";
import { ModuloCodigo } from "../modulos";
import { UsuarioId } from "../usuarios";

/**
 * Papéis sugeridos de uso comum.
 *
 * Papéis existem como conveniência de modelagem e UX; a autorização real
 * continua sendo baseada em permissões.
 */
export const PAPEIS_PADRAO = {
  /** Papel global de plataforma. */
  SUPERADMIN: "SUPERADMIN",
  /** Papel administrativo geral do locatário. */
  ADMIN: "ADMIN",
  /** Papel intermediário de gestão. */
  GERENTE: "GERENTE",
  /** Papel operacional padrão. */
  OPERADOR: "OPERADOR",
  /** Papel de leitura sem ações mutáveis. */
  LEITOR: "LEITOR",
} as const;

/**
 * União literal dos papéis padrão fornecidos pelo sistema.
 */
export type PapelPadrao = (typeof PAPEIS_PADRAO)[keyof typeof PAPEIS_PADRAO];

/**
 * Rótulo de papel atribuído a um usuário.
 *
 * Papéis podem variar por locatário e servem como agrupadores semânticos
 * e de UX. O motor de autorização não deve depender apenas deles.
 */
export type Papel = string;

/**
 * Catálogo canônico de permissões do sistema.
 *
 * Este objeto é o contrato oficial de permissões e deve evitar o uso de
 * strings mágicas espalhadas pelo sistema.
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
  TENANT_USUARIO_OBTER: "tenant.usuario.obter",
  TENANT_USUARIO_INATIVAR: "tenant.usuario.inativar",
  TENANT_USUARIO_REDEFINIR_SENHA: "tenant.usuario.redefinirSenha",

  TENANT_RBAC_PAPEL_CRIAR: "tenant.rbac.papel.criar",
  TENANT_RBAC_PAPEL_ATUALIZAR: "tenant.rbac.papel.atualizar",
  TENANT_RBAC_PAPEL_LISTAR: "tenant.rbac.papel.listar",
  TENANT_RBAC_PERMISSAO_ATRIBUIR: "tenant.rbac.permissao.atribuir",
  TENANT_RBAC_PERMISSAO_REMOVER: "tenant.rbac.permissao.remover",
  TENANT_RBAC_PERMISSAO_LISTAR: "tenant.rbac.permissao.listar",
  TENANT_RBAC_USUARIO_PAPEIS_ATUALIZAR: "tenant.rbac.usuario.papeis.atualizar",

  TENANT_AUDITORIA_LER: "tenant.auditoria.ler",

  TENANT_ASSINATURA_LER: "tenant.assinatura.ler",
  TENANT_ASSINATURA_ATUALIZAR: "tenant.assinatura.atualizar",

  TENANT_TRANSACAO_ATUALIZAR: "tenant.transacao.atualizar",

  AUTH_SESSAO_VALIDAR: "auth.sessao.validar",
  AUTH_SESSAO_REVOGAR: "auth.sessao.revogar",
} as const;

/**
 * União literal das permissões oficiais do sistema.
 */
export type Permissao = (typeof Permissoes)[keyof typeof Permissoes];

/**
 * 
 */
export type AutorizacaoSnapshot = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  papeis: Papel[];
  permissoes: Permissao[];
  modulos: ModuloCodigo[];
};

/**
 * Entrada da operação que resolve papéis e permissões de um contexto.
 */
export interface ResolverPermissoesInput {
  /** Contexto base sobre o qual a resolução será feita. */
  ctx: ContextoExecucao;
}

/**
 * Saída da resolução de autorização.
 *
 * Retorna o contexto usado na operação e os conjuntos de papéis/permissões
 * efetivamente resolvidos.
 */
export interface ResolverPermissoesOutput {
  /** Contexto utilizado ou enriquecido durante a resolução. */
  ctx: ContextoExecucao;
  /** Permissões finais reconhecidas para o usuário. */
  permissoes: Permissao[];
  /** Papéis finais reconhecidos para o usuário. */
  papeis: Papel[];
}

/**
 * Resultado assíncrono da operação de resolver permissões.
 */
export type ResolverPermissoesResult = Promise< Result<ResolverPermissoesOutput, ErroApp> >;

/**
 * Entrada da operação que resolve papéis e permissões de um contexto.
 */
export interface AutorizarOperacaoInput {
  ctx: ContextoExecucao;
  permissao: Permissao;
}

/**
 * Resultado assíncrono da autorização da operação.
 */
export type AutorizarOperacaoResult = Result<void, ErroApp>;

/**
 * 
 */
export interface ResolverAutorizacaoInput {
  ctx: ContextoExecucao;
}

/**
 * 
 */
export interface ResolverAutorizacaoOutput {
  ctx: ContextoExecucao;
}

/**
 * 
 */
export type ResolverAutorizacaoResult = Promise<Result<ResolverAutorizacaoOutput, ErroApp>>
