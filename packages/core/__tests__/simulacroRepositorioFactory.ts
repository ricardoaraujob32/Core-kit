// packages/core/__tests__/simulacroRepositorioFactory.ts

import type { ErroApp } from "../src/kernel";

export type FalhaSimuladaRepositorio = {
  codigo?: ErroApp["codigo"];
  mensagem?: string;
  detalhes?: Record<string, unknown>;
};

export type ControleFalhasRepositorio<Operacao extends string> = {
  simularFalha(operacao: Operacao, falha?: FalhaSimuladaRepositorio): void;
  limparFalhas(): void;
  possuiFalha(operacao: Operacao): boolean;
  erroFalha(operacao: Operacao): ErroApp;
};

export function criarControleFalhasRepositorio<Operacao extends string>(params: {
  namespace: string;
  mensagemPadrao: string;
}): ControleFalhasRepositorio<Operacao> {
  const falhas = new Map<Operacao, FalhaSimuladaRepositorio | undefined>();

  return {
    simularFalha(operacao, falha) {
      falhas.set(operacao, falha);
    },

    limparFalhas() {
      falhas.clear();
    },

    possuiFalha(operacao) {
      return falhas.has(operacao);
    },

    erroFalha(operacao): ErroApp {
  const falha = falhas.get(operacao);

      return {
        codigo: falha?.codigo ?? "ERRO_REPOSITORIO",
        mensagem: falha?.mensagem ?? params.mensagemPadrao,
        detalhes: {
          namespace: params.namespace,
          operacao,
          simulada: true,
          ...falha?.detalhes,
        },
      };
    }
  };
}