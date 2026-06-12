// apps/api/src/routes/locatarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard.js";
import { ativarConfiguracaoLocatarioController, atualizarConfiguracaoLocatarioController, criarConfiguracaoLocatarioController, listarConfiguracoesLocatarioController, obterConfiguracaoAtivaLocatarioController, 
  obterMeuLocatarioController } from "../modules/locatarios/locatarios.controller.js";
import { AtualizarConfiguracaoBodyDto, ConfiguracaoIdParamsDto, CriarConfiguracaoBodyDto, LocatarioIdParamsDto } from "../modules/locatarios/locatarios.dto.js";

/**
 * 
 * @param app 
 */
export const locatariosRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Fluxo do próprio locatário:
   * admin do tenant consulta somente o próprio locatário.
   */
  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id",
    { preHandler: [authGuard] },
    obterMeuLocatarioController,
  );

  /**
   * Configurações do próprio locatário.
   */
  app.get<{ Params: LocatarioIdParamsDto }>(
    "/me/locatario/configuracoes",
    { preHandler: [authGuard] },
    listarConfiguracoesLocatarioController,
  );

  /**
   * 
   */
  app.get<{ Params: LocatarioIdParamsDto }>(
    "/me/locatario/configuracoes/ativa",
    { preHandler: [authGuard] },
    obterConfiguracaoAtivaLocatarioController,
  );

  /**
   * 
   */
  app.post<{ Params: LocatarioIdParamsDto; Body: CriarConfiguracaoBodyDto; }>(
    "/me/locatario/configuracoes",
    { preHandler: [authGuard] },
    criarConfiguracaoLocatarioController,
  );

  /**
   * 
   */
  app.patch<{ Params: ConfiguracaoIdParamsDto; Body: AtualizarConfiguracaoBodyDto; }>(
    "/me/locatario/configuracoes/:configuracaoId",
    { preHandler: [authGuard] },
    atualizarConfiguracaoLocatarioController,
  );

  /**
   * 
   */
  app.post<{ Params: ConfiguracaoIdParamsDto }>(
    "/me/locatario/configuracoes/:configuracaoId/ativar",
    { preHandler: [authGuard] },
    ativarConfiguracaoLocatarioController,
  );
};
