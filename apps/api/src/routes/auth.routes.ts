// apps/api/src/routes/auth.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { loginController, logoutController, meController, refreshController } from "../modules/auth/auth.controller.js";
import { authGuard } from "../middlewares/authGuard.js";
import { LoginPlataformaBodyDto, LogoutPlataformaBodyDto, RefreshPlataformaBodyDto } from "../modules/auth/auth.plataforma.dto.js";
import { loginPlataformaController, logoutPlataformaController, refreshPlataformaController } from "../modules/auth/auth.plataforma.controller.js";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/auth/login", 
    loginController
  );
  
  app.get(
    "/auth/me", 
    { preHandler: [authGuard] }, 
    meController
  );
  
  app.post<{ Body: RefreshPlataformaBodyDto }>(
    "/auth/plataforma/refresh",
    refreshPlataformaController,
  );

  app.post<{ Body: LogoutPlataformaBodyDto }>(
    "/auth/plataforma/logout",
    logoutPlataformaController,
  );

  app.post<{ Body: LoginPlataformaBodyDto }>(
    "/auth/plataforma/login",
    loginPlataformaController,
  );
};