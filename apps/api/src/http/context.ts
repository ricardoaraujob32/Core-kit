import type { ContextoExecucao, Permissao } from "@core-kit/core";
import type { FastifyRequest } from "fastify";

/**
 * Cabeçalhos temporários (somente DEV) para simular autenticação/autorização:
 * - x-locatario-id
 * - x-usuario-id
 * - x-permissoes: "usuarios:criar,usuarios:listar"
 */
export function buildContextFromRequest(req: FastifyRequest): ContextoExecucao {
  const locatarioId: string = String(req.headers["x-locatario-id"] ?? "locatario-dev");
  const usuarioIdHeader: unknown = req.headers["x-usuario-id"];
  const usuarioId: string | undefined = usuarioIdHeader ? String(usuarioIdHeader) : undefined;

  const permissoesHeader: unknown = req.headers["x-permissoes"];
  const permissoes: Permissao[] | undefined = permissoesHeader
    ? String(permissoesHeader)
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : undefined;

  return { locatarioId, usuarioId, permissoes };
}
