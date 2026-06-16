// apps/api/src/index.ts

import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./routes/health.routes.js";
import { authRoutes } from "./routes/auth.routes.js";
import { locatariosRoutes } from "./routes/locatarios.routes.js";
import { usuariosRoutes } from "./routes/usuarios.routes.js";
import { assinaturaModulosRoutes } from "./routes/assinaturaModulos.routes.js";
import { clientesRoutes } from "./routes/clientes.routes.js";
import { fornecedoresRoutes } from "./routes/fornecedores.routes.js";
import { produtosRoutes } from "./routes/produtos.routes.js";
import { vendasRoutes } from "./routes/vendas.routes.js";
import { auditoriaRoutes } from "./routes/auditoria.routes.js";
import { plataformaRoutes } from "./routes/plataforma/plataforma.routes.js";
import { dashboardRoutes } from "./routes/dashboard.routes.js";

export const routes: FastifyPluginAsync = async (app) => {
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api" });
  await app.register(locatariosRoutes, { prefix: "/api" });
  await app.register(usuariosRoutes, { prefix: "/api" });
  await app.register(assinaturaModulosRoutes, { prefix: "/api" } );
  await app.register(clientesRoutes, { prefix: "/api" });
  await app.register(fornecedoresRoutes, { prefix: "/api" });
  await app.register(produtosRoutes, { prefix: "/api" });
  await app.register(vendasRoutes, { prefix: "/api" });
  await app.register(auditoriaRoutes, { prefix: "/api" });
  await app.register(plataformaRoutes, { prefix: "/api/plataforma" });
  await app.register(dashboardRoutes, { prefix: "/api" });
};