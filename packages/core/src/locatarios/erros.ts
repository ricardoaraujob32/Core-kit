// packages/core/src/locatarios/erros.ts

import { createErroApp } from "../kernel";
import { LocatarioId } from "./tipos";

/**
 * 
 * @param detalhes 
 * @returns 
 */
export function locatarioInvalido(detalhes?: Record<string, unknown>) {
  return createErroApp({codigo: "LOCATARIO_INVALIDO", detalhes});
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function locatarioNaoEncontrado(locatarioId: LocatarioId) {
  return createErroApp({codigo: "LOCATARIO_NAO_ENCONTRADO", detalhes: { locatarioId } });
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function locatarioSuspenso(locatarioId: LocatarioId) {
  return createErroApp({codigo: "LOCATARIO_SUSPENSO", detalhes: { locatarioId, status: "SUSPENSO" } });
}

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function locatarioEncerrado(locatarioId: LocatarioId) {
  return createErroApp({codigo: "LOCATARIO_ENCERRADO", detalhes: { locatarioId, status: "ENCERRADO" } });
}
