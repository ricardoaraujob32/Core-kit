import type { ContextoExecucao, ModuloCodigo, Permissao } from "@core-kit/core";
import {
  exigirAlguma,
  exigirModuloHabilitado,
  exigirTodas,
  isErr,
  possuiPermissao,
} from "@core-kit/core";

export type GuardOptions = {
  modulo?: ModuloCodigo;
  permissao?: Permissao;
  todasPermissoes?: readonly Permissao[];
  algumaPermissao?: readonly Permissao[];
};

export type GuardError = {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
};

export type GuardResult =
  | { ok: true }
  | { ok: false; error: GuardError };

export function aplicarGuardsHttp(
  ctx: ContextoExecucao,
  options?: GuardOptions,
): GuardResult {
  if (!options) {
    return { ok: true };
  }

  if (options.modulo) {
    const moduloResult = exigirModuloHabilitado(ctx, options.modulo);
    if (isErr(moduloResult)) {
      return {
        ok: false,
        error: {
          codigo: moduloResult.error.codigo,
          mensagem:
            moduloResult.error.mensagem ?? "Módulo não habilitado.",
          detalhes: moduloResult.error.detalhes,
        },
      };
    }
  }

  if (options.permissao) {
    const permissaoResult = possuiPermissao(ctx, options.permissao);
    if (isErr(permissaoResult)) {
      return {
        ok: false,
        error: {
          codigo: permissaoResult.error.codigo,
          mensagem:
            permissaoResult.error.mensagem ?? "Permissão ausente.",
          detalhes: permissaoResult.error.detalhes,
        },
      };
    }
  }

  if (options.todasPermissoes && options.todasPermissoes.length > 0) {
    const todasResult = exigirTodas(ctx, options.todasPermissoes);
    if (isErr(todasResult)) {
      return {
        ok: false,
        error: {
          codigo: todasResult.error.codigo,
          mensagem:
            todasResult.error.mensagem ??
            "Nem todas as permissões requeridas foram concedidas.",
          detalhes: todasResult.error.detalhes,
        },
      };
    }
  }

  if (options.algumaPermissao && options.algumaPermissao.length > 0) {
    const algumaResult = exigirAlguma(ctx, options.algumaPermissao);
    if (isErr(algumaResult)) {
      return {
        ok: false,
        error: {
          codigo: algumaResult.error.codigo,
          mensagem:
            algumaResult.error.mensagem ??
            "Nenhuma das permissões requeridas foi concedida.",
          detalhes: algumaResult.error.detalhes,
        },
      };
    }
  }

  return { ok: true };
}