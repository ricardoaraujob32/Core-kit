// packages/core/src/ROPHelpers.ts

import { Result, wrapErr, wrapOk } from "./result";
import { CodigoErroApp, ErroApp, erroApp, mapCodigoErroToMensagemErro, isErroApp, normalizarMensagem } from "./erros";

/**
 * Fábrica de erros padronizados para ROP. Normaliza argumentos e usa o construtor padrão.
 * @param params um objeto que encapsula os dados necessários, dos quais somente codigo é obrigatório.
 * - codigo: codigo de erro padronizado. Obrigatório.
 * - mensagem: se não fornecida, vai exibir mensagem padronizada a partir do código.
 * - detalhes: Detalhes estruturados para cliente/logs. Deve ser JSON-safe.
 * - causa: Causa original do erro (ex: exceção capturada). Nunca deve ser enviada diretamente ao cliente.
 * @returns um erro padronizado para ser usado em API ROP
 */
export function createErroApp<T = never>(params: {codigo: CodigoErroApp; mensagem?: string | null; detalhes?: Record<string, unknown>; causa?: unknown;}): Result<T, ErroApp> {
  const codigo = params.codigo;
  const mensagem = normalizarMensagem(params.mensagem) || mapCodigoErroToMensagemErro(codigo);
  const detalhes = params.detalhes;
  const causa = params.causa;

  return wrapErr(erroApp(codigo, mensagem, detalhes, causa));
}

/**
 * Tenta executar uma função e captura uma exceção se necessário
 * @param fn função a ser executada, não pede argumentos e retorna T
 * @returns retorna Ok com sucesso; se uma exceção for lançada, um Err com erro interno e a causa
 */
export function fromThrowable<T>(fn: () => T,): Result<T, ErroApp> {
  try {
    return wrapOk(fn());
  } catch (e) {
    return isErroApp(e) ? wrapErr(e) : createErroApp({ codigo: "ERRO_INTERNO", causa: e });
  }
}

/**
 * O mesmo que fromThrowable, mas de forma assíncrona
 * @param fn função a ser executada, não pede argumentos e retorna uma Promise de T
 * @returns retorna uma Promise de Ok com sucesso; se uma exceção for lançada, uma Promise de Err com erro interno e a causa
 */
export async function fromThrowableAsync<T>(fn: () => Promise<T>,): Promise<Result<T, ErroApp>> {
  try {
    return wrapOk(await fn());
  } catch (e) {
    return isErroApp(e) ? wrapErr(e) : createErroApp({ codigo: "ERRO_INTERNO", causa: e });
  }
}

