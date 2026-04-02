// apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts

import type { ErroApp, LocatarioId, Usuario, UsuarioId, UsuariosRepositorio, Result } from "@core-kit/core";
import { wrapOk} from "@core-kit/core";
import { PrismaDb } from "../tipos";
import { mapearErroInfra } from "../erros";

/**
 * Mapeia o status persistido do banco para o contrato do domínio de usuários.
 *
 * @param status Status persistido no banco.
 * @returns Status adaptado para o contrato do domínio.
 */
function mapStatusUsuario(status: "ATIVO" | "BLOQUEADO"): Usuario["status"] {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "BLOQUEADO":
      return "BLOQUEADO";
  }
}

/**
 * Mapeia uma linha persistida para a entidade de domínio `Usuario`.
 *
 * @param row Linha retornada pelo Prisma.
 * @returns Entidade `Usuario` compatível com o Core.
 */
function mapUsuario(row: {
  usuario_id: string;
  locatario_id: string | null;
  email: string;
  nome: string;
  senha_hash: string;
  status: "ATIVO" | "BLOQUEADO";
  ultimo_login_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
}): Usuario {
  return {
    usuarioId: row.usuario_id as UsuarioId,
    locatarioId: row.locatario_id as LocatarioId | null,
    email: row.email,
    nome: row.nome,
    senhaHash: row.senha_hash,
    status: mapStatusUsuario(row.status),
    ultimoLoginEm: row.ultimo_login_em,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    excluidoEm: row.excluido_em,
  };
}

/**
 * Repositório operacional de usuários.
 *
 * Responsabilidades:
 * - atender casos de uso do domínio de usuários;
 * - suportar consulta por identidade, e-mail e listagem por locatário;
 * - permanecer separado da infraestrutura de autenticação.
 *
 * Observação:
 * - este adapter segue o contrato operacional do Core;
 * - não deve ser reutilizado como adapter de auth.
 */
export function createUsuariosRepositorio(
  db: PrismaDb,
): UsuariosRepositorio {
  return {
    /**
     * Persiste um novo usuário.
     *
     * Observação:
     * - o e-mail é normalizado para minúsculas antes da persistência.
     *
     * @param params Dados completos necessários para criação.
     * @returns `Ok({ usuarioId })` quando a persistência é concluída.
     */
    async criar(params): Promise<Result<{ usuarioId: UsuarioId }, ErroApp>> {
      try {
        await db.usuarios.create({
          data: {
            usuario_id: params.usuarioId,
            locatario_id: params.locatarioId,
            email: params.email.toLowerCase(),
            nome: params.nome,
            senha_hash: params.senhaHash,
            status: params.status,
            ultimo_login_em: params.ultimoLoginEm,
            criado_em: params.criadoEm,
            atualizado_em: params.atualizadoEm,
            excluido_em: params.excluidoEm,
          },
        });

        return wrapOk({
          usuarioId: params.usuarioId,
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.criar",
          detalhes: {
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
            email: params.email.toLowerCase(),
          },
        });
      }
    },

    /**
     * Busca um usuário por identificador dentro do locatário.
     *
     * Observação:
     * - esta consulta não filtra `excluido_em`;
     * - isso preserva a semântica do repositório em memória atual.
     *
     * @param params Escopo do locatário e usuário desejado.
     * @returns `Ok(usuario | null)` quando a consulta é concluída.
     */
    async buscarPorId(params): Promise<Result<Usuario | null, ErroApp>> {
      try {
        const row = await db.usuarios.findFirst({
          where: {
            usuario_id: params.usuarioId,
            locatario_id: params.locatarioId,
          },
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            nome: true,
            senha_hash: true,
            status: true,
            ultimo_login_em: true,
            criado_em: true,
            atualizado_em: true,
            excluido_em: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk(mapUsuario(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.buscarPorId",
          detalhes: {
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * Busca um usuário por e-mail normalizado dentro de um locatário.
     *
     * Observação:
     * - filtra apenas usuários não excluídos;
     * - normaliza o e-mail para minúsculas antes da busca.
     *
     * @param params Escopo do locatário e e-mail normalizado.
     * @returns `Ok(usuario | null)` quando a consulta é concluída.
     */
    async buscarPorEmailNoLocatario(
      params,
    ): Promise<Result<Usuario | null, ErroApp>> {
      try {
        const emailNormalizado = params.emailNormalizado.toLowerCase();

        const row = await db.usuarios.findFirst({
          where: {
            locatario_id: params.locatarioId,
            email: emailNormalizado,
            excluido_em: null,
          },
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            nome: true,
            senha_hash: true,
            status: true,
            ultimo_login_em: true,
            criado_em: true,
            atualizado_em: true,
            excluido_em: true,
          },
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk(mapUsuario(row));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.buscarPorEmailNoLocatario",
          detalhes: {
            locatarioId: params.locatarioId,
            emailNormalizado: params.emailNormalizado.toLowerCase(),
          },
        });
      }
    },

    /**
     * Lista usuários pertencentes a um locatário.
     *
     * Observação:
     * - filtra apenas usuários não excluídos;
     * - ordena por `usuario_id` para compatibilidade com cursor simples;
     * - aplica `cursor/skip` quando cursor estiver presente.
     *
     * @param params Escopo do locatário e paginação opcional.
     * @returns `Ok(usuarios)` quando a consulta é concluída.
     */
    async listarPorLocatario(params): Promise<Result<Usuario[], ErroApp>> {
      try {
        const rows = await db.usuarios.findMany({
          where: {
            locatario_id: params.locatarioId,
            excluido_em: null,
          },
          orderBy: {
            usuario_id: "asc",
          },
          ...(params.cursor
            ? {
                cursor: {
                  usuario_id: params.cursor,
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: {
            usuario_id: true,
            locatario_id: true,
            email: true,
            nome: true,
            senha_hash: true,
            status: true,
            ultimo_login_em: true,
            criado_em: true,
            atualizado_em: true,
            excluido_em: true,
          },
        });

        return wrapOk(rows.map(mapUsuario));
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.listarPorLocatario",
          detalhes: {
            locatarioId: params.locatarioId,
            limite: params.limite,
            cursor: params.cursor,
          },
        });
      }
    },

    /**
     * Atualiza integralmente um usuário.
     *
     * @param usuario Entidade de domínio já validada.
     * @returns `Ok(usuario)` quando a persistência é concluída.
     */
    async atualizar(usuario): Promise<Result<Usuario, ErroApp>> {
      try {
        await db.usuarios.update({
          where: {
            usuario_id: usuario.usuarioId,
          },
          data: {
            locatario_id: usuario.locatarioId,
            email: usuario.email.toLowerCase(),
            nome: usuario.nome,
            senha_hash: usuario.senhaHash,
            status: usuario.status,
            ultimo_login_em: usuario.ultimoLoginEm,
            criado_em: usuario.criadoEm,
            atualizado_em: usuario.atualizadoEm,
            excluido_em: usuario.excluidoEm,
          },
        });

        return wrapOk({
          ...usuario,
          email: usuario.email.toLowerCase(),
        });
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.atualizar",
          detalhes: {
            usuarioId: usuario.usuarioId,
            locatarioId: usuario.locatarioId,
          },
        });
      }
    },

    /**
     * Atualiza o instante do último login do usuário.
     *
     * Observação:
     * - respeita o escopo do locatário;
     * - ignora usuários já excluídos.
     *
     * @param params Escopo do locatário, usuário e instante.
     * @returns `Ok(void)` quando a atualização é concluída.
     */
    async atualizarUltimoLogin(params): Promise<Result<void, ErroApp>> {
      try {
        await db.usuarios.updateMany({
          where: {
            usuario_id: params.usuarioId,
            locatario_id: params.locatarioId,
            excluido_em: null,
          },
          data: {
            ultimo_login_em: params.quando,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "usuarios.atualizarUltimoLogin",
          detalhes: {
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
          },
        });
      }
    },
  };
}
