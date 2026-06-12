// packages/core/__tests__/rbac/simulacros/rbacSimulacroRepositorio.ts

import { wrapErr, wrapOk } from "../../../src/kernel";
import type { AutorizacaoRepositorio, RbacRepositorio } from "../../../src/rbac/portasRepositorio";
import type { AutorizacaoSnapshot, Papel, Permissao } from "../../../src/rbac/tipos";
import { Permissoes } from "../../../src/rbac/tipos";
import { criarControleFalhasRepositorio } from "../../simulacroRepositorioFactory";
import type { ErroApp, Result } from "../../../src/kernel";

/**
 * 
 */
type OperacaoRbac =
  | "listarPermissoesEfetivasDoUsuario"
  | "listarPapeisDoUsuario"
  | "obterSnapshot";

/**
 * 
 */  
export type RbacSimulacroRepositorio = RbacRepositorio &
  AutorizacaoRepositorio & {
    stats(): {
      listarPermissoesEfetivasDoUsuario: number;
      listarPapeisDoUsuario: number;
      obterSnapshot: number;
    };
    simularFalha(operacao: OperacaoRbac): void;
    limparFalhas(): void;
  };

/**
 * 
 * @param params 
 * @returns 
 */
export function criarRbacSimulacroRepositorio(params: {
  permissoes?: Permissao[];
  papeis?: Papel[];
  modulos?: string[];
} = {}): RbacSimulacroRepositorio {
  const falhas = criarControleFalhasRepositorio<OperacaoRbac>({
    namespace: "teste.rbac",
    mensagemPadrao: "Falha simulada no repositório de RBAC.",
  });

  const stats = {
    listarPermissoesEfetivasDoUsuario: 0,
    listarPapeisDoUsuario: 0,
    obterSnapshot: 0,
  };

  const permissoes = params.permissoes ?? [Permissoes.TENANT_USUARIO_LISTAR];
  const papeis = params.papeis ?? ["ADMIN"];
  const modulos = params.modulos ?? ["VENDAS"];

  return {
    stats() {
      return { ...stats };
    },

    simularFalha(operacao) {
      falhas.simularFalha(operacao);
    },

    limparFalhas() {
      falhas.limparFalhas();
    },

  async listarPermissoesEfetivasDoUsuario(_params: { locatarioId: string; usuarioId: string } ): Promise<Result<Permissao[], ErroApp>> {
    stats.listarPermissoesEfetivasDoUsuario++;

    if (falhas.possuiFalha("listarPermissoesEfetivasDoUsuario")) {
      return wrapErr(falhas.erroFalha("listarPermissoesEfetivasDoUsuario"));
    }

    return wrapOk([...permissoes]);
  },

    async listarPapeisDoUsuario(_params: { locatarioId: string; usuarioId: string } ): Promise<Result<Papel[], ErroApp>> {
      stats.listarPapeisDoUsuario++;

      if (falhas.possuiFalha("listarPapeisDoUsuario")) {
        return wrapErr(falhas.erroFalha("listarPapeisDoUsuario"));
      }

      return wrapOk([...papeis]);
    },

    async obterSnapshot(
      paramsSnapshot: {
        locatarioId: string;
        usuarioId: string;
        isPlataforma?: boolean;
      },
    ): Promise<Result<AutorizacaoSnapshot, ErroApp>> {
      stats.obterSnapshot++;

      if (falhas.possuiFalha("obterSnapshot")) {
        return wrapErr(falhas.erroFalha("obterSnapshot"));
      }

      const snapshot: AutorizacaoSnapshot = {
        locatarioId: paramsSnapshot.locatarioId,
        usuarioId: paramsSnapshot.usuarioId,
        papeis: [...papeis],
        permissoes: [...permissoes],
        modulos: modulos as never,
      };

      return wrapOk(snapshot);
    },
  };
}