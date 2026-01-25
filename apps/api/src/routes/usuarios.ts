// apps/api/src/routes/usuarios.ts
import type { FastifyInstance } from "fastify";

import {
  criarUsuario,
  listarUsuarios,
  exigirPermissao,
  ok,
  err,
  appError,
} from "@core-kit/core";

import { wrapRoute } from "../http/wrapRoute";
import type { Deps } from "../di";

type CriarUsuarioBody = {
  nome?: unknown;
};

export async function registerUsuariosRoutes(app: FastifyInstance, deps: Deps): Promise<void> {
  /**
   * GET /usuarios
   * Permissão: "usuarios:listar"
   */
  app.get(
    "/usuarios",
    wrapRoute(async (ctx) => {
      const p = exigirPermissao(ctx, "usuarios:listar");
      if (!p.ok) return p;

      return listarUsuarios(ctx, { usuariosRepo: deps.usuariosRepo });
    }),
  );

  /**
   * POST /usuarios
   * body: { nome: string }
   * Permissão: "usuarios:criar"
   */
  app.post(
    "/usuarios",
    wrapRoute(async (ctx, req) => {
      const p = exigirPermissao(ctx, "usuarios:criar");
      if (!p.ok) return p;

      const body = (req.body ?? {}) as CriarUsuarioBody;

      if (typeof body.nome !== "string") {
        return err(appError("VALIDATION", 'Campo "nome" deve ser string.'));
      }

      // O core vai normalizar e validar o conteúdo (trim, tamanho etc)
      return criarUsuario(
        ctx,
        { usuariosRepo: deps.usuariosRepo, gerarId: deps.gerarId },
        { nome: body.nome },
      );
    }),
  );

  /**
   * Dica (opcional): health de usuários p/ debug
   */
  app.get(
    "/usuarios/_ping",
    wrapRoute(async () => ok({ ok: true })),
  );
}
