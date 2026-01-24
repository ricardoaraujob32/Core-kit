import type { ContextoExecucao, Permissao } from "@core-kit/core";
import type { FastifyRequest } from "fastify";

const HEADER_LOCATARIO_ID = "x-locatario-id";
const HEADER_USUARIO_ID = "x-usuario-id";
const HEADER_PERMISSOES = "x-permissoes";

function headerToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return undefined;
}

function readHeader(req: FastifyRequest, name: string): string | undefined {
  return headerToString(req.headers[name])?.trim() || undefined;
}

function parsePermissoesCsv(raw: string | undefined): Permissao[] | undefined {
  if (!raw) return undefined;

  const items = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  if (items.length === 0) return undefined;

  // remove duplicadas mantendo ordem
  const unique = Array.from(new Set(items));
  return unique as Permissao[];
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
  const locatarioId = readHeader(req, HEADER_LOCATARIO_ID) || "locatario-dev";
  const usuarioId = readHeader(req, HEADER_USUARIO_ID);
  const permissoes = parsePermissoesCsv(readHeader(req, HEADER_PERMISSOES));

  return { locatarioId, usuarioId, permissoes };
}
