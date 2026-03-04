// apps/api/src/http/wrapSuperAdminRoute.ts
import type { FastifyRequest } from "fastify";
import type { ContextoExecucao, Result, AppError } from "@core-kit/core";
import { appError } from "@core-kit/core";
import { wrapRoute, type RouteFn } from "./wrapRoute";

function isSuperAdmin(ctx: ContextoExecucao): boolean {
  const permissoes = ctx.permissoes ?? [];
  return permissoes.includes("superadmin:acesso") || permissoes.includes("superadmin:*");
}

export function wrapSuperAdminRoute<TSaida>(fn: RouteFn<TSaida>) {
  return wrapRoute(async (ctx, req: FastifyRequest): Promise<Result<TSaida, AppError>> => {
    if (!isSuperAdmin(ctx)) {
      return { ok: false, error: appError("FORBIDDEN", "Acesso restrito ao superadministrador.") };
    }
    return fn(ctx, req);
  });
}