// apps/api/src/routes/plataforma/plataforma.routes.ts

import type { FastifyInstance } from "fastify";
import { authGuard } from "../../middlewares/authGuard.js";
import { listarLocatariosPlataformaController, obterLocatarioPlataformaController, criarLocatarioPlataformaController, atualizarLocatarioPlataformaController,
  suspenderLocatarioPlataformaController, reativarLocatarioPlataformaController, encerrarLocatarioPlataformaController,
  ativarConfiguracaoLocatarioController, atualizarConfiguracaoLocatarioController, criarConfiguracaoLocatarioController, obterConfiguracaoAtivaLocatarioController,
  listarConfiguracoesLocatarioController,
  listarModulosLocatarioPlataformaController,
  vincularModuloLocatarioPlataformaController,
  desvincularModuloLocatarioPlataformaController
} from "../../modules/locatarios/locatarios.controller.js";
import type { LocatarioIdParamsDto, CriarLocatarioBodyDto, AtualizarLocatarioBodyDto, SuspenderLocatarioBodyDto, ReativarLocatarioBodyDto, EncerrarLocatarioBodyDto, AtualizarConfiguracaoBodyDto, ConfiguracaoIdOnlyParamsDto, CriarConfiguracaoBodyDto, ConfiguracaoIdParamsDto,
} from "../../modules/locatarios/locatarios.dto.js";
import { listarUsuariosLocatarioPlataformaController } from "../../modules/usuarios/usuarios.controller.js";
import { ModuloIdParamsDto, VincularModuloAssinaturaBodyDto } from "../../modules/assinaturas/assinaturaModulos.dto.js";

export async function plataformaRoutes(app: FastifyInstance) {
  app.get(
    "/locatarios",
    { preHandler: [authGuard] },
    listarLocatariosPlataformaController,
  );


  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id",
    { preHandler: [authGuard] },
    obterLocatarioPlataformaController,
  );

  app.post<{ Body: CriarLocatarioBodyDto }>(
    "/locatarios",
    { preHandler: [authGuard] },
    criarLocatarioPlataformaController,
  );

  app.patch<{
    Params: LocatarioIdParamsDto;
    Body: AtualizarLocatarioBodyDto;
  }>(
    "/locatarios/:id",
    { preHandler: [authGuard] },
    atualizarLocatarioPlataformaController,
  );

  app.post<{
    Params: LocatarioIdParamsDto;
    Body: SuspenderLocatarioBodyDto;
  }>(
    "/locatarios/:id/suspender",
    { preHandler: [authGuard] },
    suspenderLocatarioPlataformaController,
  );

  app.post<{
    Params: LocatarioIdParamsDto;
    Body: ReativarLocatarioBodyDto;
  }>(
    "/locatarios/:id/reativar",
    { preHandler: [authGuard] },
    reativarLocatarioPlataformaController,
  );

  app.post<{
    Params: LocatarioIdParamsDto;
    Body: EncerrarLocatarioBodyDto;
  }>(
    "/locatarios/:id/encerrar",
    { preHandler: [authGuard] },
    encerrarLocatarioPlataformaController,
  );

  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id/usuarios",
    { preHandler: [authGuard] },
    listarUsuariosLocatarioPlataformaController,
  );

  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id/configuracoes",
    { preHandler: [authGuard] },
    listarConfiguracoesLocatarioController,
  );

  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id/configuracoes/ativa",
    { preHandler: [authGuard] },
    obterConfiguracaoAtivaLocatarioController,
  );

  app.post<{ Params: LocatarioIdParamsDto; Body: CriarConfiguracaoBodyDto;}>(
    "/locatarios/:id/configuracoes",
    { preHandler: [authGuard] },
    criarConfiguracaoLocatarioController,
  );

  app.patch<{ Params: ConfiguracaoIdParamsDto; Body: AtualizarConfiguracaoBodyDto; }>(
    "/locatarios/:id/configuracoes/:configuracaoId",
    { preHandler: [authGuard] },
    atualizarConfiguracaoLocatarioController,
  );

  app.post<{ Params: ConfiguracaoIdParamsDto }>(
    "/locatarios/:id/configuracoes/:configuracaoId/ativar",
    { preHandler: [authGuard] },
    ativarConfiguracaoLocatarioController,
  );

  app.get<{ Params: LocatarioIdParamsDto }>(
    "/locatarios/:id/modulos",
    { preHandler: [authGuard] },
    listarModulosLocatarioPlataformaController,
  );

  app.post<{ Params: LocatarioIdParamsDto; Body: VincularModuloAssinaturaBodyDto;}>(
    "/locatarios/:id/modulos",
    { preHandler: [authGuard] },
    vincularModuloLocatarioPlataformaController,
  );

  app.delete<{ Params: LocatarioIdParamsDto & ModuloIdParamsDto;}>(
    "/locatarios/:id/modulos/:moduloId",
    { preHandler: [authGuard] },
    desvincularModuloLocatarioPlataformaController,
  );
}