// apps/api/src/routes/usuarios.ts
import type { FastifyInstance } from "fastify";
import { criarUsuario } from "@core-kit/core";
import { wrapRoute } from "../http/wrapRoute";
import { deps } from "../dependencyInjection";

export async function registrarRotasUsuarios(app: FastifyInstance) {
  app.post(
    "/usuarios",
    wrapRoute(async (ctx, req) => {
      const body = req.body as { nome?: string };
      return criarUsuario(ctx, deps, { nome: body.nome ?? "" });
    })
  );
}
