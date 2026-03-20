import type { FastifyRequest } from "fastify";
import type { ModuloCodigo, Permissao, ContextoExecucao, UsuarioId, LocatarioId, Papel } from "@core-kit/core";
import {
  comModulosHabilitados,
  createContextoExecucao,
  isErr,
} from "@core-kit/core";

type BuildContextErr = {
  ok: false;
  error: {
    codigo: string;
    mensagem: string;
    detalhes?: Record<string, unknown>;
  };
};

type BuildContextOk = {
  ok: true;
  value: ContextoExecucao;
};

export type BuildContextResult = BuildContextOk | BuildContextErr;

type SessaoValidada = {
  usuarioId: UsuarioId;
  locatarioId: LocatarioId;
};

type ContextoAutorizado = {
  locatarioId: LocatarioId;
  usuarioId: UsuarioId;
  papeis?: readonly Papel[];
  permissoes?: readonly Permissao[];
};

type BuildContextDeps = {
  validarSessao: (input: { accessToken: string }) => Promise<
    | { ok: true; value: SessaoValidada }
    | { ok: false; error: { codigo: string; mensagem: string; detalhes?: Record<string, unknown> } }
  >;
  resolverContextoAutorizado: (input: {
    usuarioId: UsuarioId;
    locatarioId: LocatarioId;
  }) => Promise<
    | { ok: true; value: ContextoAutorizado }
    | { ok: false; error: { codigo: string; mensagem: string; detalhes?: Record<string, unknown> } }
  >;
  listarModulosHabilitados?: (input: { locatarioId: LocatarioId }) => Promise<
    | { ok: true; value: { modulos: Array<{ codigo: ModuloCodigo }> } }
    | { ok: false; error: { codigo: string; mensagem: string; detalhes?: Record<string, unknown> } }
  >;
};

function extractBearerToken(req: FastifyRequest): string | null {
  const raw = req.headers.authorization;
  if (!raw) return null;

  const [scheme, token] = raw.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function mapError(error: {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
}): BuildContextErr {
  return {
    ok: false,
    error: {
      codigo: error.codigo,
      mensagem: error.mensagem,
      detalhes: error.detalhes,
    },
  };
}

export function createBuildContextFromRequest(deps: BuildContextDeps) {
  return async function buildContextFromRequest(
    req: FastifyRequest,
  ): Promise<BuildContextResult> {
    const token = extractBearerToken(req);

    if (!token) {
      return {
        ok: false,
        error: {
          codigo: "NAO_AUTENTICADO",
          mensagem: "Bearer token ausente.",
        },
      };
    }

    const sessaoResult = await deps.validarSessao({ accessToken: token });
    if (!sessaoResult.ok) {
      return mapError(sessaoResult.error);
    }

    const contextoResult = await deps.resolverContextoAutorizado({
      usuarioId: sessaoResult.value.usuarioId,
      locatarioId: sessaoResult.value.locatarioId,
    });

    if (!contextoResult.ok) {
      return mapError(contextoResult.error);
    }

    try {
      const ctxBase = createContextoExecucao({
        locatarioId: contextoResult.value.locatarioId,
        usuarioId: contextoResult.value.usuarioId,
        papeis: contextoResult.value.papeis as readonly string[] | undefined,
        permissoes: contextoResult.value.permissoes as readonly Permissao[] | undefined,
      });

      if (!deps.listarModulosHabilitados) {
        return { ok: true, value: ctxBase };
      }

      const modulosResult = await deps.listarModulosHabilitados({
        locatarioId: contextoResult.value.locatarioId,
      });

      if (!modulosResult.ok) {
        return mapError(modulosResult.error);
      }

      return {
        ok: true,
        value: comModulosHabilitados(
          ctxBase,
          modulosResult.value.modulos.map((m) => m.codigo),
        ),
      };
    } catch (causa) {
      return {
        ok: false,
        error: {
          codigo: "ERRO_INTERNO",
          mensagem: "Falha ao construir ContextoExecucao.",
          detalhes: {
            causa,
            usuarioId: contextoResult.value.usuarioId,
            locatarioId: contextoResult.value.locatarioId,
          },
        },
      };
    }
  };
}