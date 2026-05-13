// packages/core/src/kernel/ROPHelpers.ts

import { Result, wrapErr, wrapOk } from "./result";
import { CodigoErroApp, ErroApp, erroApp, isErroApp } from "./erros";

/**
 * Propósito do arquivo:
 * Fornece helpers para o padrão ROP (Result-Oriented Programming),
 * incluindo criação padronizada de erros, captura segura de exceções
 * e normalização de mensagens.
 *
 * Este módulo centraliza a adaptação entre exceções imperativas e o fluxo
 * funcional baseado em `Result<T, ErroApp>`.
 */

/**
 * Fábrica de erros padronizados para ROP. Normaliza argumentos e usa o construtor padrão.
 * @param params um objeto que encapsula os dados necessários, dos quais somente codigo é obrigatório.
 * - codigo: codigo de erro padronizado. Obrigatório.
 * - mensagem: se não fornecida, vai exibir mensagem padronizada a partir do código.
 * - detalhes: Detalhes estruturados para cliente/logs. Deve ser JSON-safe.
 * - causa: Causa original do erro (ex: exceção capturada). Nunca deve ser enviada diretamente ao cliente.
 * @returns um erro padronizado para ser usado em API ROP
 */
export function createErroApp<T = never, Codigo extends string = CodigoErroApp,>(params: {codigo: Codigo; mensagem: string; detalhes?: Record<string, unknown>; causa?: unknown;}): Result<T, ErroApp> {
  const codigo = params.codigo;
  const mensagem = params.mensagem;
  const detalhes = params.detalhes;
  const causa = params.causa;

  return wrapErr(erroApp(codigo, mensagem, detalhes, causa));
}

/**
 * Helper para mensagem de erro. Normaliza mensagem vazia para "".
 * @param mensagem a mensagem
 * @returns mensagem normalizada; se vazia, retorna ""
 */
export function normalizarMensagem(mensagem?: string | null): string | undefined {  
  if (mensagem === null || mensagem === undefined) return "";
  const m = mensagem.trim();
  return m.length ? m : "";
}

/**
 * Executa uma função protegendo contra exceções imperativas.
 *
 * Regras:
 * - se retornar normalmente → `Ok`
 * - se lançar `Result Err` → preserva
 * - se lançar `ErroApp` → preserva
 * - caso contrário → converte para `ERRO_INTERNO`
 *
 * Importante:
 * Este helper deve ser usado na borda do sistema (infra/adapters),
 * não dentro do domínio puro.
 *
 * @param fn função a ser executada, não pede argumentos e retorna T
 * @returns retorna Ok com sucesso; se uma exceção for lançada, um Err com erro interno e a causa
 */
export function fromThrowable<T>(fn: () => T,): Result<T, ErroApp> {
  try {
    return wrapOk(fn());
  } catch (e) {
    // Opção B: se jogaram um Result Err, preserva.
    if (isResultErrErroApp(e)) return e as Result<T, ErroApp>;

    // Se jogaram um ErroApp direto, preserva.
    if (isErroApp(e)) return wrapErr(e);

    // Caso contrário, normaliza para erro interno.
    return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "", causa: e });
  }
}

/**
 * Versão assíncrona de `fromThrowable`.
 *
 * Ideal para integração com I/O (DB, HTTP, filesystem),
 * mantendo a semântica de erro padronizada do Core.
 *
 * @param fn função a ser executada, não pede argumentos e retorna uma Promise de T
 * @returns retorna uma Promise de Ok com sucesso; se uma exceção for lançada, uma Promise de Err com erro interno e a causa
 */
export async function fromThrowableAsync<T>(fn: () => Promise<T>,): Promise<Result<T, ErroApp>> {
  try {
    return wrapOk(await fn());
  } catch (e) {
    // Opção B: se jogaram um Result Err, preserva.
    if (isResultErrErroApp(e)) return e as Result<T, ErroApp>;

    // Se jogaram um ErroApp direto, preserva.
    if (isErroApp(e)) return wrapErr(e);

    // Caso contrário, normaliza para erro interno.
    return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "", causa: e });
  }
}

/**
 * Verifica se é um Record de string e unknown
 * @param v o valor
 * @returns true se for, do contrário false
 */
function isObjectRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/**
 * Detecta se o valor é um Result Err cujo error é um ErroApp.
 * (tolerância: protege contra throw(createErroApp(...)) ou throw(wrapErr(...)))
 * @param v o valor
 * @returns true se for, do contrário false
 */
function isResultErrErroApp(v: unknown): v is Result<unknown, ErroApp> {
  if (!isObjectRecord(v)) return false;
  if (v["ok"] !== false) return false;
  if (!("error" in v)) return false;

  const err = (v as Record<string, unknown>)["error"];
  return isErroApp(err);
}
