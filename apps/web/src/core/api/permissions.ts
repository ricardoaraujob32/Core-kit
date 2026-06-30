// web/src/core/api/permissions.ts

import type { StatusUsuario } from "../../features/tenant-admin/usuarios/tipos";

export const USUARIOS_PERMISSIONS = {
  LISTAR: "tenant.usuario.listar",
  CRIAR: "tenant.usuario.criar",
  ATUALIZAR: "tenant.usuario.atualizar",
} as const;

export const USUARIOS_MODULE = "USUARIOS" as const;
export const CLIENTES_MODULE = "CLIENTES" as const;
export const FORNECEDORES_MODULE = "FORNECEDORES" as const;
export const PRODUTOS_MODULE = "PRODUTOS" as const;
export const TRANSACOES_MODULE = "TRANSACOES" as const;
export const ORDENS_SERVICO_MODULE = "ORDENS_SERVICO" as const;

export const CLIENTES_PERMISSIONS = {
  LISTAR: "tenant.cliente.listar",
  CRIAR: "tenant.cliente.criar",
  ATUALIZAR: "tenant.cliente.atualizar",
  EXCLUIR: "tenant.cliente.excluir",
} as const;

export const FORNECEDORES_PERMISSIONS = {
  LISTAR: "tenant.fornecedor.listar",
  CRIAR: "tenant.fornecedor.criar",
  ATUALIZAR: "tenant.fornecedor.atualizar",
  EXCLUIR: "tenant.fornecedor.excluir",
} as const;

export const PRODUTOS_PERMISSIONS = {
  LISTAR: "tenant.produto.listar",
  CRIAR: "tenant.produto.criar",
  ATUALIZAR: "tenant.produto.atualizar",
  EXCLUIR: "tenant.produto.excluir",
} as const;

export const TRANSACOES_PERMISSIONS = {
  LISTAR: "tenant.transacao.listar",
  CRIAR: "tenant.transacao.criar",
  ATUALIZAR: "tenant.transacao.atualizar",
  CANCELAR: "tenant.transacao.cancelar",
  CONCLUIR: "tenant.transacao.concluir",
} as const;

export const ORDENS_SERVICO_PERMISSIONS = {
  LISTAR: "tenant.ordens_servico.ler",
  CRIAR: "tenant.ordens_servico.criar",
  ATUALIZAR: "tenant.ordens_servico.atualizar",
  CANCELAR: "tenant.ordens_servico.cancelar",
  CONCLUIR: "tenant.ordens_servico.concluir",
  GERAR_VENDA: "tenant.ordens_servico.gerar_venda",
} as const;

export type UsuarioAction =
  | "listar"
  | "ver"
  | "criar"
  | "editar"
  | "inativar"
  | "reativar";

export type FrontendAuthorizationContext = {
  permissions?: string[];
  modules?: string[];
  isSuperAdmin?: boolean;
};

function normalizarLista(values?: string[]) {
  return (values ?? []).map((value) => value.trim().toUpperCase());
}

export function hasPermission(
  ctx: FrontendAuthorizationContext,
  permission: string,
): boolean {
  if (ctx.isSuperAdmin) return true;
  return normalizarLista(ctx.permissions).includes(permission.trim().toUpperCase());
}

export function hasModule(
  ctx: FrontendAuthorizationContext,
  moduleCode: string,
): boolean {
  if (ctx.isSuperAdmin) return true;
  return normalizarLista(ctx.modules).includes(moduleCode.trim().toUpperCase());
}

export function canAccessUsuariosModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return (
    hasModule(ctx, USUARIOS_MODULE) &&
    hasPermission(ctx, USUARIOS_PERMISSIONS.LISTAR)
  );
}

function canReadCrudModule(
  ctx: FrontendAuthorizationContext,
  moduleCode: string,
  listPermission: string,
): boolean {
  return hasModule(ctx, moduleCode) && hasPermission(ctx, listPermission);
}

function canWriteCrudModule(
  ctx: FrontendAuthorizationContext,
  moduleCode: string,
  writePermission: string,
): boolean {
  return hasModule(ctx, moduleCode) && hasPermission(ctx, writePermission);
}

export function canAccessClientesModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canReadCrudModule(ctx, CLIENTES_MODULE, CLIENTES_PERMISSIONS.LISTAR);
}

export function canCreateCliente(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(ctx, CLIENTES_MODULE, CLIENTES_PERMISSIONS.CRIAR);
}

export function canEditCliente(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(
    ctx,
    CLIENTES_MODULE,
    CLIENTES_PERMISSIONS.ATUALIZAR,
  );
}

export function canAccessFornecedoresModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canReadCrudModule(
    ctx,
    FORNECEDORES_MODULE,
    FORNECEDORES_PERMISSIONS.LISTAR,
  );
}

export function canCreateFornecedor(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    FORNECEDORES_MODULE,
    FORNECEDORES_PERMISSIONS.CRIAR,
  );
}

export function canEditFornecedor(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(
    ctx,
    FORNECEDORES_MODULE,
    FORNECEDORES_PERMISSIONS.ATUALIZAR,
  );
}

export function canAccessProdutosModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canReadCrudModule(ctx, PRODUTOS_MODULE, PRODUTOS_PERMISSIONS.LISTAR);
}

export function canCreateProduto(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(ctx, PRODUTOS_MODULE, PRODUTOS_PERMISSIONS.CRIAR);
}

export function canEditProduto(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(
    ctx,
    PRODUTOS_MODULE,
    PRODUTOS_PERMISSIONS.ATUALIZAR,
  );
}

export function canAccessTransacoesModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canReadCrudModule(
    ctx,
    TRANSACOES_MODULE,
    TRANSACOES_PERMISSIONS.LISTAR,
  );
}

export function canCreateTransacao(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(
    ctx,
    TRANSACOES_MODULE,
    TRANSACOES_PERMISSIONS.CRIAR,
  );
}

export function canEditTransacao(ctx: FrontendAuthorizationContext): boolean {
  return canWriteCrudModule(
    ctx,
    TRANSACOES_MODULE,
    TRANSACOES_PERMISSIONS.ATUALIZAR,
  );
}

export function canCancelTransacao(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    TRANSACOES_MODULE,
    TRANSACOES_PERMISSIONS.CANCELAR,
  );
}

export function canConcludeTransacao(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    TRANSACOES_MODULE,
    TRANSACOES_PERMISSIONS.CONCLUIR,
  );
}

export function canAccessOrdensServicoModule(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canReadCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.LISTAR,
  );
}

export function canCreateOrdemServico(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.CRIAR,
  );
}

export function canEditOrdemServico(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.ATUALIZAR,
  );
}

export function canCancelOrdemServico(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.CANCELAR,
  );
}

export function canConcludeOrdemServico(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.CONCLUIR,
  );
}

export function canGenerateVendaFromOrdemServico(
  ctx: FrontendAuthorizationContext,
): boolean {
  return canWriteCrudModule(
    ctx,
    ORDENS_SERVICO_MODULE,
    ORDENS_SERVICO_PERMISSIONS.GERAR_VENDA,
  );
}

export function canCreateUsuario(
  ctx: FrontendAuthorizationContext,
): boolean {
  return (
    hasModule(ctx, USUARIOS_MODULE) &&
    hasPermission(ctx, USUARIOS_PERMISSIONS.CRIAR)
  );
}

export function canEditUsuario(
  ctx: FrontendAuthorizationContext,
): boolean {
  return (
    hasModule(ctx, USUARIOS_MODULE) &&
    hasPermission(ctx, USUARIOS_PERMISSIONS.ATUALIZAR)
  );
}

export function canToggleUsuarioStatus(
  ctx: FrontendAuthorizationContext,
  statusAtual: StatusUsuario,
): boolean {
  if (
    !hasModule(ctx, USUARIOS_MODULE) ||
    !hasPermission(ctx, USUARIOS_PERMISSIONS.ATUALIZAR)
  ) {
    return false;
  }

  return statusAtual === "ATIVO" || statusAtual === "INATIVO";
}

export function canRunUsuarioAction(
  ctx: FrontendAuthorizationContext,
  action: UsuarioAction,
  statusAtual?: StatusUsuario,
): boolean {
  switch (action) {
    case "listar":
    case "ver":
      return canAccessUsuariosModule(ctx);
    case "criar":
      return canCreateUsuario(ctx);
    case "editar":
      return canEditUsuario(ctx);
    case "inativar":
    case "reativar":
      return statusAtual ? canToggleUsuarioStatus(ctx, statusAtual) : false;
    default:
      return false;
  }
}
