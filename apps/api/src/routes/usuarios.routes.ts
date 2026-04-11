// apps/api/src/routes/usuarios.routes.ts

import type { FastifyPluginAsync } from "fastify";
import { authGuard } from "../middlewares/authGuard";
import {
  atualizarUsuarioController,
  criarUsuarioController,
  desativarUsuarioController,
  listarUsuariosController,
  obterUsuarioController,
  reativarUsuarioController,
} from "../modules/usuarios/usuarios.controller";

/**
 * Registra as rotas HTTP do módulo operacional de usuários.
 *
 * Regras gerais:
 * - todas as rotas exigem autenticação prévia via `authGuard`;
 * - a autorização fina por permissão acontece nos controllers;
 * - o escopo efetivo do locatário é sempre derivado do contexto autenticado.
 *
 * Superfície atual:
 * - `GET /usuarios`
 * - `GET /usuarios/:id`
 * - `POST /usuarios`
 * - `PATCH /usuarios/:id`
 * - `POST /usuarios/:id/inativar`
 * - `POST /usuarios/:id/reativar`
 *
 * @param app Instância Fastify usada para registrar as rotas.
 * @returns Plugin assíncrono concluído.
 */
export const usuariosRoutes: FastifyPluginAsync = async (app) => {
  /**
   * Lista usuários do locatário autenticado.
   */
  app.get(
    "/usuarios",
    { preHandler: [authGuard], },
    listarUsuariosController,
  );

  /**
   * Obtém um usuário específico do locatário autenticado.
   */
  app.get<{ Params: { id: string } }>(
    "/usuarios/:id",
    { preHandler: [authGuard], },
    obterUsuarioController,
  );

  /**
   * Cria um novo usuário no locatário autenticado.
   */
  app.post<{ Body: { email: string; nome: string; senha: string } }>(
  "/usuarios",
  { preHandler: [authGuard] },
  criarUsuarioController,
);

  /**
   * Atualiza dados cadastrais de um usuário.
   */
  app.patch<{ Params: { id: string }; Body: { email?: string; nome?: string };}>(
  "/usuarios/:id",
  { preHandler: [authGuard] },
  atualizarUsuarioController,
);

  /**
   * Inativa um usuário existente.
   */
  app.post<{ Params: { id: string } }>(
  "/usuarios/:id/inativar",
  { preHandler: [authGuard] },
  desativarUsuarioController,
);

  /**
   * Reativa um usuário previamente inativado.
   */
  app.post<{ Params: { id: string } }>(
  "/usuarios/:id/reativar",
  { preHandler: [authGuard] },
  reativarUsuarioController,
);
};
