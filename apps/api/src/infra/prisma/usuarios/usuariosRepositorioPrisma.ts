// apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts

import type { ErroApp, LocatarioId, Usuario, UsuarioId, UsuariosRepositorio, Result } from "@core-kit/core";
import { wrapOk} from "@core-kit/core";
import { PrismaDb } from "../tipos.js";
import { mapearErroInfra } from "../erros.js";
import { status_usuario } from "@prisma/client";

type UsuarioRow = {
  usuario_id: string;
  locatario_id: string | null;
  email: string;
  nome: string;
  senha_hash: string;
  status: status_usuario;
  ultimo_login_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
  excluido_em: Date | null;
};

const usuarioSelect = {
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
} as const;

/**
 * Mapeia o status persistido do banco para o contrato do domínio de usuários.
 *
 * @param status Status persistido no banco.
 * @returns Status adaptado para o contrato do domínio.
 */
function mapStatusUsuario(status: status_usuario): Usuario["status"] {
  switch (status) {
    case "ATIVO":
      return "ATIVO";
    case "INATIVO":
    case "BLOQUEADO":
      return "INATIVO";
    case "SUSPENSO":
      return "SUSPENSO";
    case "ENCERRADO":
      return "ENCERRADO";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

/**
 * Mapeia o status do domínio para o enum persistido no banco.
 *
 * Observação:
 * - o domínio usa `INATIVO`;
 * - o banco persiste isso como `BLOQUEADO`.
 */
function mapStatusUsuarioParaPersistencia(status: Usuario["status"]): status_usuario {
  switch (status) {
    case "ATIVO":
      return status_usuario.ATIVO;
    case "INATIVO":
      return status_usuario.INATIVO;
    case "SUSPENSO":
      return status_usuario.SUSPENSO;
    case "ENCERRADO":
      return status_usuario.ENCERRADO;
  }
}

/**
 * Mapeia uma linha persistida para a entidade de domínio `Usuario`.
 *
 * @param row Linha retornada pelo Prisma.
 * @returns Entidade `Usuario` compatível com o Core.
 */
function mapUsuario(row: UsuarioRow): Usuario {
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
export function createUsuariosRepositorio(db: PrismaDb): UsuariosRepositorio {
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
            status: mapStatusUsuarioParaPersistencia(params.status),
            ultimo_login_em: params.ultimoLoginEm,
            criado_em: params.criadoEm,
            atualizado_em: params.atualizadoEm,
          },
        });

        return wrapOk({
          usuarioId: params.usuarioId,
        });
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.criar",
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
          select: usuarioSelect,
        });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk(mapUsuario(row));
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.buscarPorId",
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
    async buscarPorEmailNoLocatario(params: { locatarioId: LocatarioId | null; emailNormalizado: string; }): Promise<Result<Usuario | null, ErroApp>> {
      try {
        const emailNormalizado = params.emailNormalizado.toLowerCase();

        const row = params.locatarioId === null
          ? await db.usuarios_plataforma.findFirst({
              where: {
                email: emailNormalizado,
                excluido_em: null,
              },
              select: {
                usuario_id: true,
                email: true,
                nome: true,
                senha_hash: true,
                status: true,
                ultimo_login_em: true,
                criado_em: true,
                atualizado_em: true,
                excluido_em: true,
              },
            })
          : await db.usuarios.findFirst({
              where: {
                locatario_id: params.locatarioId,
                email: emailNormalizado,
                excluido_em: null,
              },
              select: usuarioSelect,
            });

        if (!row) {
          return wrapOk(null);
        }

        return wrapOk(mapUsuario({
          usuario_id: row.usuario_id,
          locatario_id: params.locatarioId,
          email: row.email,
          nome: row.nome,
          senha_hash: row.senha_hash,
          status: row.status,
          ultimo_login_em: row.ultimo_login_em,
          criado_em: row.criado_em,
          atualizado_em: row.atualizado_em,
          excluido_em: row.excluido_em,
        }));
      } catch (causa) {
        console.error("ERRO REAL:", causa);

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
    async listarPorLocatario(params: { locatarioId: LocatarioId; limite?: number; cursor?: string; }): Promise<Result<Usuario[], ErroApp>> {
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
                  locatario_id_usuario_id: {
                    locatario_id: params.locatarioId,
                    usuario_id: params.cursor,
                  },
                },
                skip: 1,
              }
            : {}),
          ...(params.limite ? { take: params.limite } : {}),
          select: usuarioSelect,
        });

        return wrapOk(rows.map(mapUsuario));
      } catch (causa) {
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.listarPorLocatario",
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
        if (usuario.locatarioId === null) {
          return mapearErroInfra(new Error("Usuário de plataforma não é suportado por este repositório"), {
            entidade: "usuarios",
            operacao: "infra.usuarios.atualizar",
            detalhes: {
              usuarioId: usuario.usuarioId,
              locatarioId: usuario.locatarioId,
            },
          });
        }

        await db.usuarios.updateMany({
          where: {
            usuario_id: usuario.usuarioId,
            locatario_id: usuario.locatarioId,
          },
          data: {
            locatario_id: usuario.locatarioId,
            email: usuario.email.toLowerCase(),
            nome: usuario.nome,
            senha_hash: usuario.senhaHash,
            status: mapStatusUsuarioParaPersistencia(usuario.status),
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
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.atualizar",
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
        console.error("ERRO REAL:", causa);

        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.atualizarUltimoLogin",
          detalhes: {
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
          },
        });
      }
    },

    /**
     * 
     * @param params 
     * @returns 
     */
    async atualizarSenha(params): Promise<Result<void, ErroApp>> {
      try {
        await db.usuarios.updateMany({
          where: {
            usuario_id: params.usuarioId,
            locatario_id: params.locatarioId,
            excluido_em: null,
          },
          data: {
            senha_hash: params.senhaHash,
            atualizado_em: params.atualizadoEm,
          },
        });

        return wrapOk(undefined);
      } catch (causa) {
        return mapearErroInfra(causa, {
          entidade: "usuarios",
          operacao: "infra.usuarios.atualizarSenha",
          detalhes: {
            usuarioId: params.usuarioId,
            locatarioId: params.locatarioId,
          },
        });
      }
    }
  };  
}
