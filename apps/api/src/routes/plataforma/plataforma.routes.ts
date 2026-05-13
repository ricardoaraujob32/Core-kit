// apps/api/src/routes/plataforma/plataforma.routes.ts

import type { FastifyInstance } from "fastify";
import { authGuard } from "../../middlewares/authGuard";
import { listarLocatariosPlataformaController, obterLocatarioPlataformaController, criarLocatarioPlataformaController, atualizarLocatarioPlataformaController,
  suspenderLocatarioPlataformaController, reativarLocatarioPlataformaController, encerrarLocatarioPlataformaController
} from "../../modules/locatarios/locatarios.controller";
import type { LocatarioIdParamsDto, CriarLocatarioBodyDto, AtualizarLocatarioBodyDto, SuspenderLocatarioBodyDto, ReativarLocatarioBodyDto, EncerrarLocatarioBodyDto,
} from "../../modules/locatarios/locatarios.dto";

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
}