// packages/core/src/modulos/erros.ts

import { createErroApp, ErroApp, Result } from "../kernel"
import { LocatarioId } from "../locatarios"

/**
 * 
 * @param locatarioId 
 * @returns 
 */
export function erroLocatarioIdInvalido(locatarioId: unknown): Result<never, ErroApp> {
  return createErroApp( { codigo:"INVALIDO", mensagem:"locatarioId inválido.", detalhes:{ locatarioId } } );
}

/**
 * 
 * @param codigo 
 * @returns 
 */
export function erroModuloCodigoInvalido(codigo: unknown): Result<never, ErroApp> {
  return createErroApp({ codigo:"INVALIDO", mensagem:"Código do módulo inválido.", detalhes:{ codigo } });
}

/**
 * 
 * @param causa 
 * @returns 
 */
export function erroRepositorioModulos(causa?: unknown): Result<never, ErroApp> {
  return createErroApp({ codigo:"ERRO_INTERNO", mensagem:"Falha ao consultar módulos habilitados.", detalhes:{ causa } });
}

/**
 * 
 * @param codigo 
 * @param locatarioId 
 * @returns 
 */
export function erroModuloNaoHabilitado(codigo: string, locatarioId: LocatarioId): Result<never, ErroApp> {
  return createErroApp({ codigo:"NAO_AUTORIZADO", mensagem:"Módulo não habilitado para o locatário.", detalhes:{codigo, locatarioId} });
}
