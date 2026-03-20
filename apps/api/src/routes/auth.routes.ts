// apps/api/src/routes/auth.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { loginController, refreshController } from "../modules/auth/auth.controller";

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/login", loginController);
  app.post("/auth/refresh", refreshController);
};