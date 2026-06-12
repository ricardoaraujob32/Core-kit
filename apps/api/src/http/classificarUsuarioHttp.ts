// apps/api/src/http/classificarUsuarioHttp.ts

import type { FastifyRequest } from "fastify";

export type UsuarioHttpAutenticado = NonNullable<FastifyRequest["usuario"]>;

export type ClassificacaoUsuarioHttp =
  | {
      tipo: "TENANT";
      usuario: UsuarioHttpAutenticado & { locatarioId: string };
    }
  | {
      tipo: "PLATAFORMA";
      usuario: UsuarioHttpAutenticado & { locatarioId: null };
    };

export function classificarUsuarioHttp(usuario: UsuarioHttpAutenticado): ClassificacaoUsuarioHttp {
  if (usuario.locatarioId === null) {
    return {
      tipo: "PLATAFORMA",
      usuario: usuario as UsuarioHttpAutenticado & { locatarioId: null },
    };
  }

  return {
    tipo: "TENANT",
    usuario: usuario as UsuarioHttpAutenticado & { locatarioId: string },
  };
}