import type { FastifyRequest } from "fastify";
import type {
  ModulosHabilitadosService,
  Papel,
  Permissao,
} from "@core-kit/core";
import {
  comModulosHabilitados,
  createContextoExecucao,
  isErr,
} from "@core-kit/core";

type HeaderValue = string | string[] | undefined;

type BuildContextDeps = {
  modulosHabilitadosService: ModulosHabilitadosService;
};

type BuildContextOk = {
  ok: true;
  value: ReturnType<typeof createContextoExecucao>;
};

type BuildContextErr = {
  ok: false;
  error: {
    codigo: string;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
};

export type BuildContextResult = BuildContextOk | BuildContextErr;

function headerToString(value: HeaderValue): string | undefined {
  if (Array.isArray(value)) return value[0];
  if (typeof value === "string") return value;
  return undefined;
}

function parseCsvHeader(value: HeaderValue): string[] | undefined {
  const raw = headerToString(value);
  if (!raw) return undefined;

  const values = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return values.length > 0 ? values : undefined;
}

function parsePapeisHeader(value: HeaderValue): readonly Papel[] | undefined {
  const values = parseCsvHeader(value);
  return values as readonly Papel[] | undefined;
}

function parsePermissoesHeader(
  value: HeaderValue,
): readonly Permissao[] | undefined {
  const values = parseCsvHeader(value);
  return values as readonly Permissao[] | undefined;
}

export function createBuildContextFromRequest(deps: BuildContextDeps) {
  return async function buildContextFromRequest(
    req: FastifyRequest,
  ): Promise<BuildContextResult> {
    const locatarioId = headerToString(req.headers["x-locatario-id"]);
    const usuarioId = headerToString(req.headers["x-usuario-id"]);
    const papeis = parsePapeisHeader(req.headers["x-papeis"]);
    const permissoes = parsePermissoesHeader(req.headers["x-permissoes"]);

    if (!locatarioId) {
      return {
        ok: false,
        error: {
          codigo: "INVALIDO",
          mensagem: "Cabeçalho x-locatario-id é obrigatório.",
          detalhes: { header: "x-locatario-id" },
        },
      };
    }

    try {
      const ctxBase = createContextoExecucao({
        locatarioId,
        usuarioId,
        papeis,
        permissoes,
      });

      const modulosResult =
        await deps.modulosHabilitadosService.listarModulosHabilitados({
          locatarioId,
        });

      if (isErr(modulosResult)) {
        return {
          ok: false,
          error: {
            codigo: modulosResult.error.codigo,
            mensagem: modulosResult.error.mensagem,
            detalhes: modulosResult.error.detalhes,
          },
        };
      }

      const ctx = comModulosHabilitados(
        ctxBase,
        modulosResult.value.modulos.map((m) => m.codigo),
      );

      return {
        ok: true,
        value: ctx,
      };
    } catch (causa) {
      return {
        ok: false,
        error: {
          codigo: "INVALIDO",
          mensagem: "ContextoExecucao inválido.",
          detalhes: { locatarioId, usuarioId, causa },
        },
      };
    }
  };
}