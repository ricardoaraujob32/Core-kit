// apps/api/src/tipos/fastify-context.d.ts

import "fastify";

export interface UsuarioAutenticado {
  usuarioId: string;
  locatarioId?: string | null;
  papeis: string[];
  permissoes: string[];
}

declare module "fastify" {
  interface FastifyRequest {
    requestIdApp: string;
    usuario?: UsuarioAutenticado;
  }
}
