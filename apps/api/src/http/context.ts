import type { ContextoExecucao, Permissao } from "@core-kit/core";
import type { FastifyRequest } from "fastify";

function headerToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

/**
 * Cabeçalhos temporários (somente DEV) para simular autenticação/autorização:
 * - x-locatario-id
 * - x-usuario-id
 * - x-permissoes: "usuarios:criar,usuarios:listar"
 *
 * @param req Requisição Fastify
 * @returns Contexto de execução do Core Kit
 */
export function buildContextFromRequest(req: FastifyRequest): ContextoExecucao {
  const locatarioId =
    headerToString(req.headers["x-locatario-id"])?.trim() || "locatario-dev";

  const usuarioId = headerToString(req.headers["x-usuario-id"])?.trim() || undefined;

  const permissoesRaw = headerToString(req.headers["x-permissoes"]);
  const permissoes: Permissao[] | undefined = permissoesRaw
    ? permissoesRaw
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean)
    : undefined;

  return { locatarioId, usuarioId, permissoes };
}
