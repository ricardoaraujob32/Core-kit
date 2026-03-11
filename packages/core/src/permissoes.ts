/**
 * Permissões oficiais do sistema.
 *
 * Regra de ouro:
 * - Backend, Core e Frontend compartilham ESTE contrato.
 * - Nunca usar strings mágicas fora daqui.
 * - Mudanças aqui são mudanças de domínio.
 */

export const Permissoes = {
  // ===== Plataforma (SUPERADMIN / modo plataforma)
  PLATAFORMA_LOCATARIO_CRIAR: "plataforma.locatario.criar",
  PLATAFORMA_LOCATARIO_LISTAR: "plataforma.locatario.listar",
  PLATAFORMA_USUARIO_CRIAR: "plataforma.usuario.criar",
  PLATAFORMA_USUARIO_LISTAR: "plataforma.usuario.listar",

  // ===== Tenant (ADMIN/GERENTE/OPERADOR)
  TENANT_USUARIO_CRIAR: "tenant.usuario.criar",
  TENANT_USUARIO_LISTAR: "tenant.usuario.listar",
  TENANT_USUARIO_ATUALIZAR: "tenant.usuario.atualizar",
  TENANT_USUARIO_ATRIBUIR_PAPEIS: "tenant.usuario.atribuirPapeis",

  TENANT_RBAC_PAPEL_CRIAR: "tenant.rbac.papel.criar",
  TENANT_RBAC_PAPEL_LISTAR: "tenant.rbac.papel.listar",
  TENANT_RBAC_PERMISSAO_ATRIBUIR: "tenant.rbac.permissao.atribuir",
  TENANT_RBAC_PERMISSAO_LISTAR: "tenant.rbac.permissao.listar",

  TENANT_AUDITORIA_LER: "tenant.auditoria.ler",

  // ===== Sessão/Auth
  AUTH_SESSAO_VALIDAR: "auth.sessao.validar",
  AUTH_SESSAO_REVOGAR: "auth.sessao.revogar",
} as const;

export type Permissao = (typeof Permissoes)[keyof typeof Permissoes];