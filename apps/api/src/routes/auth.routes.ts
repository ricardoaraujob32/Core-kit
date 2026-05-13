// apps/api/src/routes/auth.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { loginController, logoutController, meController, refreshController } from "../modules/auth/auth.controller";
import { authGuard } from "../middlewares/authGuard";
import { LoginPlataformaBodyDto } from "../modules/auth/auth.plataforma.dto";
import { loginPlataformaController } from "../modules/auth/auth.plataforma.controller";

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
  
  app.post(
    "/auth/refresh", 
    refreshController
  );
  
  app.post(
    "/auth/logout", 
    logoutController
  );

  app.post<{ Body: LoginPlataformaBodyDto }>(
    "/auth/plataforma/login",
    loginPlataformaController,
  );
};