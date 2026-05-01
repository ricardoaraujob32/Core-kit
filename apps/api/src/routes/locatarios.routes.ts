// apps/api/src/routes/locatarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import { ativarConfiguracaoLocatarioController, atualizarConfiguracaoLocatarioController, atualizarLocatarioSuperAdminController, criarConfiguracaoLocatarioController, criarLocatarioSuperAdminController, 
  encerrarLocatarioSuperAdminController, listarConfiguracoesLocatarioController, listarLocatariosSuperAdminController, obterConfiguracaoAtivaLocatarioController, 
  obterLocatarioSuperAdminController, obterMeuLocatarioController, reativarLocatarioSuperAdminController, suspenderLocatarioSuperAdminController } from "../modules/locatarios/locatarios.controller";
import { AtualizarConfiguracaoBodyDto, AtualizarLocatarioBodyDto, ConfiguracaoIdParamsDto, CriarConfiguracaoBodyDto, CriarLocatarioBodyDto, EncerrarLocatarioBodyDto, 
  LocatarioIdParamsDto, ReativarLocatarioBodyDto, SuspenderLocatarioBodyDto } from "../modules/locatarios/locatarios.dto";

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
   * Fluxo de superadmin:
   * listagem global de locatários.
   */
  app.get(
    "/plataforma/locatarios",
    { preHandler: [authGuard] },
    listarLocatariosSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * consulta global de locatário por id.
   */
  app.get<{ Params: LocatarioIdParamsDto }>(
    "/plataforma/locatarios/:id",
    { preHandler: [authGuard] },
    obterLocatarioSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * criação de locatário.
   */
  app.post<{ Body: CriarLocatarioBodyDto }>(
    "/plataforma/locatarios",
    { preHandler: [authGuard] },
    criarLocatarioSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * atualização cadastral de locatário.
   */
  app.patch<{ Params: LocatarioIdParamsDto;  Body: AtualizarLocatarioBodyDto; }>(
    "/plataforma/locatarios/:id",
    { preHandler: [authGuard] },
    atualizarLocatarioSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * suspensão de locatário.
   */
  app.post<{ Params: LocatarioIdParamsDto; Body: SuspenderLocatarioBodyDto; }>(
    "/plataforma/locatarios/:id/suspender",
    { preHandler: [authGuard] },
    suspenderLocatarioSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * reativação de locatário.
   */
  app.post<{ Params: LocatarioIdParamsDto; Body: ReativarLocatarioBodyDto; }>(
    "/plataforma/locatarios/:id/reativar",
    { preHandler: [authGuard] },
    reativarLocatarioSuperAdminController,
  );

  /**
   * Fluxo de superadmin:
   * encerramento de locatário.
   */
  app.post<{ Params: LocatarioIdParamsDto; Body: EncerrarLocatarioBodyDto; }>(
    "/plataforma/locatarios/:id/encerrar",
    { preHandler: [authGuard] },
    encerrarLocatarioSuperAdminController,
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

