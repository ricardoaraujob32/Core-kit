// apps/api/src/routes/auditoria.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { listarAuditoriaAtivaLocatarioController } from "../modules/auditoria/auditoria.controller";
import { listarAuditoriaPlataformaController } from "../modules/auditoria/auditoriaPlataforma.controller";

/**
 * Registra as rotas HTTP do módulo de auditoria ativa do locatário.
 *
 * Superfície atual:
 * - `GET /auditoria`
 *
 * @param app Instância Fastify.
 * @returns Plugin concluído.
 */
export const auditoriaRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Auditoria do locatário
   */
  app.get(
    "/api/auditoria",
    listarAuditoriaAtivaLocatarioController,
  );

  /**
   * Auditoria da plataforma (superadmin)
   */
  app.get(
    "/api/plataforma/auditoria",
    listarAuditoriaPlataformaController,
  );
};
