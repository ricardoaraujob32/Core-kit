// packages/core/src/kernel/index.ts

export type { Result, Ok, Err } from "./result";
export { wrapOk, isOk, wrapErr, isErr, map, mapAsync, mapErr, mapErrAsync, match,
    andThen, andThenAsync, tap, tapErr, unwrapOr, unwrapOrElse
 } from "./result";

export type { CodigoErroApp, ErroApp } from "./erros";
export { isErroApp } from "./erros";

export { createErroApp, normalizarMensagem, fromThrowable, fromThrowableAsync } from "./ROPHelpers";

export type { ContextoExecucao, CreateContextoExecucaoParams } from "./contextoExecucao";
export { createContextoExecucao, isContextoExecucao } from "./contextoExecucao";

export { comModulosHabilitados, comPapeis, comPermissoes, exigirUsuario, normalizarModulosHabilitados,
    normalizarPapeis, normalizarPermissoes, normalizarRelogio, temUsuario
} from "./autorizacao";

export { normalizarEmail, validarData, validarEmail, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio } from "./utils";

export { executarEmTransacao } from "./executarEmTransacao";

export type { HashPorta, IdPorta, RelogioPorta, TokenPorta, TransacaoPorta } from "./portasGenericas";

export type { StatusJob } from "./tipos";