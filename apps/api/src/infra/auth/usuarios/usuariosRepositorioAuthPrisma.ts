// apps/api/src/infra/auth/usuarios/usuariosRepositorioAuthPrisma.ts

import { wrapOk } from "@core-kit/core";
import type { LocatarioId, Result, ErroApp, UsuarioId } from "@core-kit/core";
import { erroInfraAuth } from "../compartilhado/errosInfraAuth";
import { PrismaDb } from "../../prisma/tipos";

/**
 * 
 */
type UsuarioAuth = {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId;
  email: string;
  senhaHash: string;
  status: "ATIVO" | "INATIVO";
};

/**
 * Repositório de usuários para autenticação (Auth).
 *
 * Responsabilidades:
 * - buscar usuário por e-mail dentro de um locatário;
 * - fornecer dados necessários para login (senha hash, status);
 * - atualizar metadados de login (best-effort).
 *
 * Observação:
 * - não deve conter lógica de autenticação;
 * - apenas acesso a dados persistidos.
 */
export function createUsuariosRepositorioAuthPrisma(db: PrismaDb) {
  return {
     /**
     * Busca um usuário pelo e-mail dentro de um locatário.
     *
     * Usado no fluxo de login para:
     * - validar existência do usuário;
     * - recuperar hash da senha;
     * - validar status (ativo/inativo).
     *
     * @param params.locatarioId Escopo do locatário.
     * @param params.email E-mail do usuário.
     * @returns `Ok(usuario)` ou `Ok(null)` se não encontrado.
     */
    async buscarPorEmail(params: { locatarioId: LocatarioId; email: string; }): Promise<Result<UsuarioAuth | null, ErroApp>> {
      try {
        const row = await db.usuarios.findFirst({
          where: {
            locatario_id: params.locatarioId,
            email: params.email,
          },
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            senha_hash: true,
            ativo: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk({
          usuarioId: row.usuario_id,
          locatarioId: row.locatario_id,
          email: row.email,
          senhaHash: row.senha_hash,
          status: row.ativo ? "ATIVO" : "INATIVO",
        });
      } catch (causa) {
        return erroInfraAuth("Falha ao buscar usuário por e-mail.", causa, {
          operacao: "auth.usuarios.buscarPorEmail",
          locatarioId: params.locatarioId,
          email: params.email,
        });
      }
    },

    /**
     * Atualiza o timestamp do último login do usuário.
     *
     * Observações:
     * - operação best-effort (não deve quebrar login);
     * - pode ser ignorada caso a coluna ainda não exista.
     *
     * @param params.usuarioId Identificador do usuário.
     * @param params.quando Timestamp do login.
     */
    async atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date; }): Promise<Result<void, ErroApp>> {
      try {
        /**
         * Ajuste aqui quando a coluna real estiver consolidada no schema.
         * O caso de uso trata esta operação como best effort.
         */
        // await db.usuarios.updateMany({
        //   where: { usuario_id: params.usuarioId },
        //   data: { ultimo_login_em: params.quando },
        // });

        return wrapOk(undefined);
      } catch (causa) {
        return erroInfraAuth("Falha ao atualizar último login.", causa, {
          operacao: "auth.usuarios.atualizarUltimoLogin",
          usuarioId: params.usuarioId,
        });
      }
    },
  };
}