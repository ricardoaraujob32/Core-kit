// packages/core/src/kernel/usecases.ts

import type { ErroApp } from "./erros.js";
import type { Result } from "./result.js";

/**
 * 
 */
export type CasoDeUso<
  TInput,
  TOutput,
  TErro extends ErroApp = ErroApp,
> = (input: TInput) => Promise<Result<TOutput, TErro>>;

/**
 * 
 */
export type DepsContextoOpcional<TContexto> = {
  ctx?: TContexto;
};

/**
 * 
 */
export type DepsContextoObrigatorio<TContexto> = {
  ctx: TContexto;
};
