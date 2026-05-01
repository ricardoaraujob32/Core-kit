// apps/api/src/routes/index.ts

import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./health.routes";
import { authRoutes } from "./auth.routes";
import { locatariosRoutes } from "./locatarios.routes";
import { usuariosRoutes } from "./usuarios.routes";
import { assinaturaModulosRoutes } from "./assinaturaModulos.routes";
import { clientesRoutes } from "./clientes.routes";
import { fornecedoresRoutes } from "./fornecedores.routes";
import { produtosRoutes } from "./produtos.routes";
import { vendasRoutes } from "./vendas.routes";

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
};