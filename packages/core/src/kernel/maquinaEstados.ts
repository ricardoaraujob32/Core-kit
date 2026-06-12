// packages/core/src/kernel/maquinaEstados.ts

import type { ErroApp } from "./erros";
import { Result, wrapOk } from "./result";
import { createErroApp } from "./ROPHelpers";

/**
 * Tabela genérica de transições:
 * estado atual -> evento -> próximo estado
 */
export type TabelaTransicoes<
  TEstado extends string,
  TEvento extends string,
> = Record<TEstado, Partial<Record<TEvento, TEstado>>>;

/**
 * 
 */
export type DefinicaoMaquinaEstados<
  TEstado extends string,
  TEvento extends string,
> = {
  tabela: TabelaTransicoes<TEstado, TEvento>;
};

/**
 * Parâmetros de transição genérica.
 */
export interface TransicionarEstadoInput<
  TEstado extends string,
  TEvento extends string,
  TContexto = unknown,
> {
  tabela: TabelaTransicoes<TEstado, TEvento>;
  estadoAtual: TEstado;
  evento: TEvento;
  contexto?: TContexto;
  onTransicaoInvalida?: (params: {
    estadoAtual: TEstado;
    evento: TEvento;
    contexto?: TContexto;
  }) => Result<never, ErroApp>;
}

/**
 * Resolve genericamente uma transição de estado.
 *
 * Em caso de sucesso, devolve o próximo estado.
 * Em caso de falha, delega a construção do erro ao callback informado.
 */
export function transicionarEstado<
  TEstado extends string,
  TEvento extends string,
  TContexto = unknown,
>(
  input: TransicionarEstadoInput<TEstado, TEvento, TContexto>,
): Result<TEstado, ErroApp> {
  const proximoEstado = input.tabela[input.estadoAtual]?.[input.evento];

  if (!proximoEstado) {
    if (input.onTransicaoInvalida) {
      return input.onTransicaoInvalida({
        estadoAtual: input.estadoAtual,
        evento: input.evento,
        contexto: input.contexto,
      });
    }

    return createErroApp({
      codigo: "TRANSICAO_ESTADO_INVALIDA",
      mensagem: "",
      detalhes: {
        estadoAtual: input.estadoAtual,
        evento: input.evento,
        contexto: input.contexto,
      },
    });
  }

  return wrapOk(proximoEstado);
}


/**
 * 
 * @param params 
 * @returns 
 */
export function criarTransicionadorEstado<
  TEstado extends string,
  TEvento extends string,
  TContexto = unknown,
>(params: {
  tabela: TabelaTransicoes<TEstado, TEvento>;
  onTransicaoInvalida?: TransicionarEstadoInput<
    TEstado,
    TEvento,
    TContexto
  >["onTransicaoInvalida"];
}) {
  return (input: {
    estadoAtual: TEstado;
    evento: TEvento;
    contexto?: TContexto;
  }): Result<TEstado, ErroApp> =>
    transicionarEstado({
      tabela: params.tabela,
      estadoAtual: input.estadoAtual,
      evento: input.evento,
      contexto: input.contexto,
      onTransicaoInvalida: params.onTransicaoInvalida,
    });
}

/**
 * 
 * @param params 
 * @returns 
 */
export function exigirEventoEstado<
  TEstado extends string,
  TEvento extends string,
  TEntidade,
  TContexto = unknown,
>(params: {
  entidade: TEntidade;
  estadoAtual: TEstado;
  evento: TEvento;
  tabela: TabelaTransicoes<TEstado, TEvento>;
  contexto?: TContexto;
  onTransicaoInvalida?: TransicionarEstadoInput<
    TEstado,
    TEvento,
    TContexto
  >["onTransicaoInvalida"];
}): Result<TEntidade, ErroApp> {
  const transicao = transicionarEstado({
    tabela: params.tabela,
    estadoAtual: params.estadoAtual,
    evento: params.evento,
    contexto: params.contexto,
    onTransicaoInvalida: params.onTransicaoInvalida,
  });

  if (!transicao.ok) return transicao;

  return wrapOk(params.entidade);
}
