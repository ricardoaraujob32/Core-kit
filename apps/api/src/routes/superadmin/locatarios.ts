// apps/api/src/routes/admin/locatarios.ts

import type { FastifyInstance } from "fastify";
import type { AppError, ContextoExecucao, Result } from "@core-kit/core";
import { appError } from "@core-kit/core";
import { wrapOk } from "@core-kit/core"; // se não existir no seu core, remova e use { ok:true, value: ... }
import { wrapRoute } from "../../http/wrapRoute";

/**
 * Permissão mínima para usar o painel de superadmin.
 * (Hoje o ctx vem de headers de DEV.)
 */
const PERMISSAO_SUPERADMIN = "admin:super";

function exigirSuperAdmin(ctx: ContextoExecucao): Result<void, AppError> {
  const permissoes = (ctx as any).permissoes as string[] | undefined;
  const ok = Array.isArray(permissoes) && permissoes.includes(PERMISSAO_SUPERADMIN);

  if (!ok) {
    return {
      ok: false,
      error: appError("FORBIDDEN", "Acesso restrito ao superadministrador."),
    };
  }
  return { ok: true, value: undefined };
}

/**
 * Dependências do “painel admin” para locatários.
 * Aqui você injeta o que for necessário (repo/usecases).
 *
 * Para já funcionar em DEV, você pode colocar implementações em memória em dependencyInjection.
 * Em produção, substitui por Prisma/SQL.
 */
export type AdminLocatariosDeps = {
  locatarios: {
    criar(input: { nome: string; planoId: string; slug?: string | null }): Promise<Result<any, AppError>>;
    suspender(input: { locatarioId: string; motivo?: string | null }): Promise<Result<void, AppError>>;
    mudarPlano(input: { locatarioId: string; planoId: string }): Promise<Result<void, AppError>>;
  };

  /**
   * “Acrescentar módulo” pode ser modelado como:
   * - habilitar módulo no plano do locatário
   * ou
   * - criar exceção por locatário (fora do plano)
   *
   * Como você já tem módulos/planos/assinaturas no core, deixo como dependência opcional.
   */
  modulos?: {
    acrescentarAoLocatario?(input: { locatarioId: string; moduloId: string }): Promise<Result<void, AppError>>;
  };
};

export async function registrarRotasAdminLocatarios(app: FastifyInstance, deps: AdminLocatariosDeps) {
  /**
   * POST /admin/locatarios
   * Criar locatário (superadmin)
   */
  app.post(
    "/admin/locatarios",
    wrapRoute(async (ctx, req) => {
      const guard = exigirSuperAdmin(ctx);
      if (!guard.ok) return guard;

      const body = (req.body ?? {}) as { nome?: string; planoId?: string; slug?: string | null };
      return deps.locatarios.criar({
        nome: body.nome ?? "",
        planoId: body.planoId ?? "",
        slug: body.slug ?? null,
      });
    }),
  );

  /**
   * POST /admin/locatarios/:id/suspender
   * Suspender locatário (superadmin)
   *
   * OBS: suspender é diferente de “excluir logicamente”.
   * Suspender costuma ser reversível, e o locatário continua existindo.
   */
  app.post(
    "/admin/locatarios/:id/suspender",
    wrapRoute(async (ctx, req) => {
      const guard = exigirSuperAdmin(ctx);
      if (!guard.ok) return guard;

      const params = req.params as { id?: string };
      const body = (req.body ?? {}) as { motivo?: string | null };

      const locatarioId = params.id ?? "";
      return deps.locatarios.suspender({ locatarioId, motivo: body.motivo ?? null });
    }),
  );

  /**
   * PUT /admin/locatarios/:id/plano
   * Mudar plano do locatário (superadmin)
   */
  app.put(
    "/admin/locatarios/:id/plano",
    wrapRoute(async (ctx, req) => {
      const guard = exigirSuperAdmin(ctx);
      if (!guard.ok) return guard;

      const params = req.params as { id?: string };
      const body = (req.body ?? {}) as { planoId?: string };

      const locatarioId = params.id ?? "";
      const planoId = body.planoId ?? "";

      return deps.locatarios.mudarPlano({ locatarioId, planoId });
    }),
  );

  /**
   * POST /admin/locatarios/:id/modulos
   * Acrescentar módulo (superadmin)
   *
   * Deixei extensível: no futuro você pode implementar como:
   * - “habilitar módulo no plano do locatário”
   * - “dar exceção por locatário”
   */
  app.post(
    "/admin/locatarios/:id/modulos",
    wrapRoute(async (ctx, req) => {
      const guard = exigirSuperAdmin(ctx);
      if (!guard.ok) return guard;

      if (!deps.modulos?.acrescentarAoLocatario) {
        return {
          ok: false,
          error: appError("NOT_IMPLEMENTED", "Operação de módulo ainda não configurada."),
        };
      }

      const params = req.params as { id?: string };
      const body = (req.body ?? {}) as { moduloId?: string };

      return deps.modulos.acrescentarAoLocatario({
        locatarioId: params.id ?? "",
        moduloId: body.moduloId ?? "",
      });
    }),
  );
}

export async function registrarRotasSuperAdminLocatarios(app: FastifyInstance) {
  // agrupa tudo sob /superadmin
  app.register(async function superadminScope(scope) {
    scope.addHook("preHandler", requireSuperAdmin);

    scope.post(
      "/locatarios",
      wrapSuperAdminRoute(async (ctx, req) => {
        const body = req.body as { nome?: string; slug?: string };
        return criarLocatario(ctx, deps, { nome: body.nome ?? "", slug: body.slug ?? "" });
      })
    );

    scope.get(
      "/locatarios/:id",
      wrapSuperAdminRoute(async (ctx, req) => {
        const params = req.params as { id: string };
        return obterLocatario(ctx, deps, { locatarioId: params.id });
      })
    );

    scope.post(
      "/locatarios/:id/suspender",
      wrapSuperAdminRoute(async (ctx, req) => {
        const params = req.params as { id: string };
        return suspenderLocatario(ctx, deps, { locatarioId: params.id });
      })
    );

    scope.post(
      "/locatarios/:id/reativar",
      wrapSuperAdminRoute(async (ctx, req) => {
        const params = req.params as { id: string };
        return reativarLocatario(ctx, deps, { locatarioId: params.id });
      })
    );
  }, { prefix: "/superadmin" });
}