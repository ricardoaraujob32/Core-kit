// packages/core/src/kernel/maquinaEstados.ts

import type { ErroApp } from "./erros";
import { Result, wrapOk } from "./result";

/**
 * Tabela genérica de transições:
 * estado atual -> evento -> próximo estado
 */
export type TabelaTransicoes<
  TEstado extends string,
  TEvento extends string,
> = Record<TEstado, Partial<Record<TEvento, TEstado>>>;

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
  onTransicaoInvalida: (params: {
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
  const proximoEstado =
    input.tabela[input.estadoAtual]?.[input.evento];

  if (!proximoEstado) {
    return input.onTransicaoInvalida({
      estadoAtual: input.estadoAtual,
      evento: input.evento,
      contexto: input.contexto,
    });
  }

  return wrapOk(proximoEstado);
}
