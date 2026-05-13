// apps/api/src/infra/prisma/auth/usuarios/usuariosRepositorioAuthPrisma.ts

import { wrapOk } from "@core-kit/core";
import type { LocatarioId, Result, ErroApp, UsuarioId, UsuarioAuth, UsuariosRepositorioAuth } from "@core-kit/core";
import { erroInfraAuth } from "../errosInfraAuth";
import { PrismaDb } from "../../tipos";
import { mapearErroInfra } from "../../erros";

/**
 * Mapeia o status persistido no banco para o contrato de auth.
 *
 * @param status Status persistido no banco.
 * @returns Status adaptado para o contrato de autenticação.
 */
function mapStatusUsuarioAuth(
  status: "ATIVO" | "INATIVO" | "SUSPENSO" | "ENCERRADO",
): UsuarioAuth["status"] {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "INATIVO":
      return "INATIVO";
    case "SUSPENSO":
    case "ENCERRADO":
      return "BLOQUEADO";
  }
}

/**
 * Repositório de usuários para autenticação (Auth).
 *
 * Responsabilidades:
 * - buscar usuário por e-mail dentro de um locatário;
 * - fornecer dados mínimos necessários ao login;
 * - atualizar metadados persistidos de autenticação.
 *
 * Observação:
 * - este adapter não deve abrir contexto SQL por conta própria;
 * - a responsabilidade de contexto transacional pertence à composição.
 */
export function createUsuariosRepositorioAuth(db: PrismaDb): UsuariosRepositorioAuth {
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
            excluido_em: null,
          },
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            senha_hash: true,
            status: true,
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
          status: mapStatusUsuarioAuth(row.status),
        });
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao buscar usuário por e-mail.",
          operacao: "auth.usuarios.buscarPorEmail",
          causa,
          detalhes: {
            locatarioId: params.locatarioId,
            email: params.email,
          },
        });
      }
    },

     /**
     * Atualiza o timestamp do último login do usuário.
     *
     * Observações:
     * - continua sendo operação best-effort do ponto de vista do fluxo;
     * - este adapter apenas executa a escrita no `db` recebido;
     * - o contexto SQL, quando necessário, deve ser aberto pela composição.
     *
     * @param params.usuarioId Identificador do usuário.
     * @param params.quando Timestamp do login.
     * @returns `Ok(void)` quando a atualização é concluída.
     */
    async atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date; }): Promise<Result<void, ErroApp>> {
      try {
        await db.usuarios.updateMany({
          where: {
            usuario_id: params.usuarioId,
            excluido_em: null,
          },
          data: {
            ultimo_login_em: params.quando,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return erroInfraAuth({
          mensagem: "Falha ao atualizar último login.",
          operacao: "auth.usuarios.atualizarUltimoLogin",
          causa,
          detalhes: {
            usuarioId: params.usuarioId,
          },
        });
      }
    },

    async buscarUsuarioPlataformaPorEmail(params) {
      try {
        const row = await db.usuarios.findFirst({
          where: {
            email: params.email,
            locatario_id: null,
            excluido_em: null,
          },
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            senha_hash: true,
            status: true,
          },
        });

        return wrapOk(
          row
            ? {
                usuarioId: row.usuario_id,
                locatarioId: row.locatario_id,
                email: row.email,
                senhaHash: row.senha_hash,
                status: mapStatusUsuarioAuth(row.status),
              }
            : null,
        );
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "auth.usuario.buscarUsuarioPlataformaPorEmail",
          detalhes: {
            email: params.email,
          },
        });
      }
    },
  };
}
