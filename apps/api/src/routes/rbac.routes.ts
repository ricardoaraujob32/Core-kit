// // apps/api/src/routes/rbac.routes.ts

// import type { FastifyPluginAsync } from "fastify";
// import { authGuard } from "../middlewares/authGuard.js";


// /**
//  * Registra as rotas HTTP do módulo de RBAC.
//  *
//  * Superfície inicial:
//  * - `POST   /rbac/papeis`
//  * - `PATCH  /rbac/papeis/:id`
//  * - `POST   /rbac/papeis/:id/permissoes`
//  * - `DELETE /rbac/papeis/:id/permissoes`
//  * - `PUT    /rbac/usuarios/:id/papeis`
//  *
//  * @param app Instância Fastify.
//  * @returns Plugin concluído.
//  */
// export const rbacRoutes: FastifyPluginAsync = async (app) => {
//   app.post(
//     "/rbac/papeis",
//     { preHandler: [authGuard] },
//     criarPapelController,
//   );

//   app.patch(
//     "/rbac/papeis/:id",
//     { preHandler: [authGuard] },
//     atualizarPapelController,
//   );

//   app.post(
//     "/rbac/papeis/:id/permissoes",
//     { preHandler: [authGuard] },
//     atribuirPermissaoAoPapelController,
//   );

//   app.delete(
//     "/rbac/papeis/:id/permissoes",
//     { preHandler: [authGuard] },
//     removerPermissaoDoPapelController,
//   );

//   app.put(
//     "/rbac/usuarios/:id/papeis",
//     { preHandler: [authGuard] },
//     atualizarPapeisDoUsuarioController,
//   );
// };
