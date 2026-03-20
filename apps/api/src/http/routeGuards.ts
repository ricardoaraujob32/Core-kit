import type { ContextoExecucao, ModuloCodigo, Permissao } from "@core-kit/core";
import {
  exigirAlguma,
  exigirModuloHabilitado,
  exigirTodas,
  exigirUsuario,
  isErr,
  possuiPermissao,
} from "@core-kit/core";

export type GuardOptions = {
  autenticado?: boolean;
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

  if (options.autenticado) {
    const authResult = exigirUsuario(ctx);
    if (isErr(authResult)) {
      return {
        ok: false,
        error: {
          codigo: authResult.error.codigo,
          mensagem: authResult.error.mensagem ?? "Autenticação obrigatória.",
          detalhes: authResult.error.detalhes,
        },
      };
    }
  }

  if (options.modulo) {
    const moduloResult = exigirModuloHabilitado(ctx, options.modulo);
    if (isErr(moduloResult)) {
      return {
        ok: false,
        error: {
          codigo: moduloResult.error.codigo,
          mensagem: moduloResult.error.mensagem ?? "Módulo não habilitado.",
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
          mensagem: permissaoResult.error.mensagem ?? "Permissão ausente.",
          detalhes: permissaoResult.error.detalhes,
        },
      };
    }
  }

  if (options.todasPermissoes?.length) {
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

  if (options.algumaPermissao?.length) {
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