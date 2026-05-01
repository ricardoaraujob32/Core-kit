// apps/api/src/index.ts

import type { FastifyPluginAsync } from "fastify";
import { healthRoutes } from "./routes/health.routes";
import { authRoutes } from "./routes/auth.routes";
import { locatariosRoutes } from "./routes/locatarios.routes";
import { usuariosRoutes } from "./routes/usuarios.routes";
import { assinaturaModulosRoutes } from "./routes/assinaturaModulos.routes";
import { clientesRoutes } from "./routes/clientes.routes";
import { vendasRoutes } from "./routes/vendas.routes";
import { fornecedoresRoutes } from "./routes/fornecedores.routes";
import { produtosRoutes } from "./routes/produtos.routes";
// import { auditoriaRoutes } from "./routes/auditoria.routes";
// import { rbacRoutes } from "./routes/rbac.routes";

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
  // await app.register(auditoriaRoutes, { prefix: "/api" });
  // await app.register(rbacRoutes, { prefix: "/api" });
};
