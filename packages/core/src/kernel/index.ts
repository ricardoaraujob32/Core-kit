// packages/core/src/kernel/index.ts

export type { Result, Ok, Err } from "./result.js";
export { wrapOk, isOk, wrapErr, isErr, map, mapAsync, mapErr, mapErrAsync, match,
    andThen, andThenAsync, tap, tapErr, unwrapOr, unwrapOrElse
 } from "./result.js";

export type { CodigoErroApp, ErroApp } from "./erros.js";
export { isErroApp } from "./erros.js";

export { createErroApp, normalizarMensagem, fromThrowable, fromThrowableAsync } from "./ROPHelpers.js";

export type { ContextoExecucao, CreateContextoExecucaoParams } from "./contextoExecucao.js";
export { createContextoExecucao, isContextoExecucao } from "./contextoExecucao.js";

export { comModulosHabilitados, comPapeis, comPermissoes, exigirUsuario, normalizarModulosHabilitados,
    normalizarPapeis, normalizarPermissoes, normalizarRelogio, temUsuario
} from "./autorizacao.js";

export { normalizarEmail, validarData, validarEmail, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio } from "./utils.js";

export { executarEmTransacao } from "./executarEmTransacao.js";

export type { HashPorta, IdPorta, RelogioPorta, TokenPorta, TransacaoPorta } from "./portasGenericas.js";

export type { StatusJob } from "./tipos.js";

export type { TabelaTransicoes, TransicionarEstadoInput } from "./maquinaEstados.js";
export { transicionarEstado } from "./maquinaEstados.js";