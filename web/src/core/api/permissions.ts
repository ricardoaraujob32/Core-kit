// web/src/core/api/permissions.ts

import type { StatusUsuario } from "../../features/tenant-admin/usuarios/types";

export const USUARIOS_PERMISSIONS = {
  LISTAR: "tenant.usuario.listar",
  CRIAR: "tenant.usuario.criar",
  ATUALIZAR: "tenant.usuario.atualizar",
} as const;

export const USUARIOS_MODULE = "USUARIOS" as const;

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
