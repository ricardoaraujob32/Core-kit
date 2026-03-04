// apps/api/src/http/requireSuperAdmin.ts
import type { FastifyReply, FastifyRequest } from "fastify";
import type { ContextoExecucao } from "@core-kit/core";

/**
 * DEV (agora): usa permissões do ctx (vindas do header x-permissoes)
 * PROD (depois): isso deve vir do JWT (claims) já validados.
 */
export function requireSuperAdmin(req: FastifyRequest, reply: FastifyReply, done: (err?: Error) => void) {
  const ctx = (req as unknown as { ctx?: ContextoExecucao }).ctx;

  const permissoes = ctx?.permissoes ?? [];
  const ok = permissoes.includes("superadmin:acesso") || permissoes.includes("superadmin:*");

  if (!ok) {
    reply.status(403).send({ error: { code: "FORBIDDEN", message: "Acesso restrito ao superadministrador." } });
    return;
  }

  done();
}